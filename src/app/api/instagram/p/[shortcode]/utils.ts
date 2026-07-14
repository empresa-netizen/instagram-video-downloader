import { RequestConfigType } from "@/types/request-config";
import { IG_GraphQLResponseDto } from "@/features/api/_dto/instagram";
import { buildDownloadBasename } from "@/lib/utils";
import { proxyFetch } from "@/lib/proxy-fetch";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const DOC_ID = "27128499623469141";
const FRIENDLY_NAME = "PolarisPostRootQuery";

type InstagramSession = {
  cookieHeader: string;
  csrfToken: string;
  lsd: string | null;
};

type InstagramMediaItem = {
  code?: string;
  pk?: string | number;
  media_type?: number;
  taken_at?: number;
  video_versions?: Array<{ url: string }>;
  video_duration?: number;
  view_count?: number;
  play_count?: number;
  image_versions2?: { candidates?: Array<{ url: string }> };
  caption?: { text?: string } | null;
  like_count?: number;
  comment_count?: number;
  user?: {
    pk?: string | number;
    username?: string;
    full_name?: string;
    profile_pic_url?: string;
    is_verified?: boolean;
  };
  carousel_media?: InstagramMediaItem[];
};

function parseCookies(setCookieHeaders: string[]): Map<string, string> {
  const cookies = new Map<string, string>();
  for (const header of setCookieHeaders) {
    const [pair] = header.split(";");
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
  return cookies;
}

function getSetCookieHeaders(response: Response): string[] {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const single = response.headers.get("set-cookie");
  return single ? [single] : [];
}

async function createInstagramSession(shortcode: string): Promise<InstagramSession> {
  const navHeaders = {
    "User-Agent": USER_AGENT,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  };

  // Warm up anonymous session on homepage first (more reliable CSRF/LSD cookies)
  const homeResponse = await proxyFetch("https://www.instagram.com/", {
    headers: navHeaders,
    redirect: "follow",
  });
  const homeHtml = await homeResponse.text();
  const cookies = parseCookies(getSetCookieHeaders(homeResponse));

  const postResponse = await proxyFetch(`https://www.instagram.com/p/${shortcode}/`, {
    headers: {
      ...navHeaders,
      ...(cookies.size
        ? {
            Cookie: Array.from(cookies.entries())
              .map(([name, value]) => `${name}=${value}`)
              .join("; "),
          }
        : {}),
    },
    redirect: "follow",
  });
  const html = await postResponse.text();
  for (const [name, value] of parseCookies(getSetCookieHeaders(postResponse))) {
    cookies.set(name, value);
  }

  const csrfToken = cookies.get("csrftoken") ?? "";
  const cookieHeader = Array.from(cookies.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

  const lsdMatch =
    html.match(/"LSD",\[\],\{"token":"([^"]+)"\}/) ??
    homeHtml.match(/"LSD",\[\],\{"token":"([^"]+)"\}/);
  const lsd = lsdMatch?.[1] ?? null;

  return { cookieHeader, csrfToken, lsd };
}

function pickBestVideoUrl(item: InstagramMediaItem | undefined): string | null {
  if (!item) return null;
  const versions = item.video_versions;
  if (versions?.length) {
    return versions[0].url;
  }
  return null;
}

function pickBestImageUrl(item: InstagramMediaItem | undefined): string | null {
  if (!item) return null;
  const candidates = item.image_versions2?.candidates;
  if (candidates?.length) {
    return candidates[0].url;
  }
  return null;
}

export type DownloadableMedia = {
  url: string;
  type: "image" | "video";
  index: number;
};

function extractSlideMedia(
  slide: InstagramMediaItem,
  index: number
): DownloadableMedia | null {
  // media_type: 1 image, 2 video
  if (slide.media_type === 2) {
    const videoUrl = pickBestVideoUrl(slide);
    if (!videoUrl) return null;
    return { url: videoUrl, type: "video", index };
  }

  const imageUrl = pickBestImageUrl(slide);
  if (!imageUrl) return null;
  return { url: imageUrl, type: "image", index };
}

export function extractDownloadableMedia(
  item: InstagramMediaItem
): DownloadableMedia[] {
  // media_type: 1 image, 2 video, 8 carousel
  if (item.media_type === 8 && item.carousel_media?.length) {
    return item.carousel_media
      .map((slide, index) => extractSlideMedia(slide, index))
      .filter((media): media is DownloadableMedia => Boolean(media));
  }

  const single = extractSlideMedia(item, 0);
  return single ? [single] : [];
}

function findVideoFromMedia(item: InstagramMediaItem): {
  videoUrl: string | null;
  isVideo: boolean;
  displayUrl: string;
  source: InstagramMediaItem;
} {
  const downloadable = extractDownloadableMedia(item);
  const firstVideo = downloadable.find((media) => media.type === "video");
  const firstItem = downloadable[0];

  let source = item;
  if (item.media_type === 8 && item.carousel_media?.length && firstVideo) {
    source = item.carousel_media[firstVideo.index] ?? item;
  }

  return {
    videoUrl: firstVideo?.url ?? null,
    isVideo: Boolean(firstVideo),
    displayUrl:
      firstItem?.type === "image"
        ? firstItem.url
        : (pickBestImageUrl(source) ?? pickBestImageUrl(item) ?? ""),
    source,
  };
}

export function mapWebInfoToLegacyGraphQL(
  item: InstagramMediaItem
): IG_GraphQLResponseDto {
  const { videoUrl, isVideo, displayUrl, source } = findVideoFromMedia(item);
  const downloadableMedia = extractDownloadableMedia(item);
  const isCarousel = item.media_type === 8;
  const username = item.user?.username ?? "";
  const caption = item.caption?.text ?? "";
  const basename = buildDownloadBasename(username, caption);

  return {
    data: {
      downloadable_media: downloadableMedia,
      download_meta: {
        username,
        caption,
        basename,
      },
      xdt_shortcode_media: {
        __typename: isCarousel
          ? "GraphSidecar"
          : isVideo
            ? "GraphVideo"
            : "GraphImage",
        __isXDTGraphMediaInterface: "XDTGraphMedia",
        id: String(item.pk ?? ""),
        shortcode: item.code ?? "",
        thumbnail_src: displayUrl,
        dimensions: { height: 0, width: 0 },
        gating_info: null,
        fact_check_overall_rating: null,
        fact_check_information: null,
        sensitivity_friction_info: null,
        sharing_friction_info: {
          should_have_sharing_friction: false,
          bloks_app_url: null,
        },
        media_overlay_info: null,
        media_preview: "",
        display_url: displayUrl,
        display_resources: displayUrl
          ? [{ src: displayUrl, config_width: 0, config_height: 0 }]
          : [],
        accessibility_caption: null,
        dash_info: {
          is_dash_eligible: false,
          video_dash_manifest: "",
          number_of_qualities: 0,
        },
        has_audio: Boolean(videoUrl),
        video_url: videoUrl ?? "",
        video_view_count: item.view_count ?? 0,
        video_play_count: item.play_count ?? 0,
        encoding_status: null,
        is_published: true,
        product_type: isVideo ? "clips" : "feed",
        title: "",
        video_duration: source.video_duration ?? item.video_duration ?? 0,
        clips_music_attribution_info: {
          artist_name: "",
          song_name: "",
          uses_original_audio: true,
          should_mute_audio: false,
          should_mute_audio_reason: "",
          audio_id: "",
        },
        is_video: isVideo,
        tracking_token: "",
        upcoming_event: null,
        edge_media_to_tagged_user: { edges: [] },
        owner: {
          id: String(item.user?.pk ?? ""),
          username: item.user?.username ?? "",
          is_verified: Boolean(item.user?.is_verified),
          profile_pic_url: item.user?.profile_pic_url ?? "",
          blocked_by_viewer: false,
          restricted_by_viewer: null,
          followed_by_viewer: false,
          full_name: item.user?.full_name ?? "",
          has_blocked_viewer: false,
          is_embeds_disabled: false,
          is_private: false,
          is_unpublished: false,
          requested_by_viewer: false,
          pass_tiering_recommendation: false,
          edge_owner_to_timeline_media: { count: 0 },
          edge_followed_by: { count: 0 },
        },
        edge_media_to_caption: {
          edges: item.caption?.text
            ? [
                {
                  node: {
                    created_at: String(item.taken_at ?? ""),
                    text: item.caption.text,
                    id: "",
                  },
                },
              ]
            : [],
        },
        can_see_insights_as_brand: false,
        caption_is_edited: false,
        has_ranked_comments: false,
        like_and_view_counts_disabled: false,
        edge_media_to_parent_comment: {
          count: item.comment_count ?? 0,
          page_info: { has_next_page: false, end_cursor: null },
          edges: [],
        },
        edge_media_to_hoisted_comment: { edges: [] },
        edge_media_preview_comment: {
          count: item.comment_count ?? 0,
          edges: [],
        },
        comments_disabled: false,
        commenting_disabled_for_viewer: false,
        taken_at_timestamp: item.taken_at ?? 0,
        edge_media_preview_like: {
          count: item.like_count ?? 0,
          edges: [],
        },
        edge_media_to_sponsor_user: { edges: [] },
        is_affiliate: false,
        is_paid_partnership: false,
        location: null,
        nft_asset_info: null,
        viewer_has_liked: false,
        viewer_has_saved: false,
        viewer_has_saved_to_collection: false,
        viewer_in_photo_of_you: false,
        viewer_can_reshare: true,
        is_ad: false,
        edge_web_media_to_related_media: { edges: [] },
        coauthor_producers: [],
        pinned_for_users: [],
      },
    },
    extensions: { is_final: true },
    status: "ok",
  };
}

export type GetInstagramPostRequest = {
  shortcode: string;
};

export type GetInstagramPostResponse = IG_GraphQLResponseDto;

export async function getInstagramPostGraphQL(
  data: GetInstagramPostRequest,
  requestConfig?: RequestConfigType
) {
  const session = await createInstagramSession(data.shortcode);

  const body = new URLSearchParams({
    av: "0",
    __d: "www",
    __user: "0",
    __a: "1",
    __req: "1",
    dpr: "2",
    __ccg: "EXCELLENT",
    fb_api_caller_class: "RelayModern",
    fb_api_req_friendly_name: FRIENDLY_NAME,
    variables: JSON.stringify({
      shortcode: data.shortcode,
      __relay_internal__pv__PolarisAIGMMediaWebLabelEnabledrelayprovider: false,
    }),
    server_timestamps: "true",
    doc_id: DOC_ID,
  });

  if (session.lsd) {
    body.set("lsd", session.lsd);
  }

  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Content-Type": "application/x-www-form-urlencoded",
    "X-FB-Friendly-Name": FRIENDLY_NAME,
    "X-IG-App-ID": "936619743392459",
    "X-CSRFToken": session.csrfToken,
    "X-Requested-With": "XMLHttpRequest",
    "X-ASBD-ID": "359341",
    Origin: "https://www.instagram.com",
    Referer: `https://www.instagram.com/p/${data.shortcode}/`,
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
  };

  if (session.cookieHeader) {
    headers.Cookie = session.cookieHeader;
  }
  if (session.lsd) {
    headers["X-FB-LSD"] = session.lsd;
  }

  return proxyFetch("https://www.instagram.com/graphql/query", {
    method: "POST",
    headers,
    body: body.toString(),
    ...requestConfig,
  });
}
