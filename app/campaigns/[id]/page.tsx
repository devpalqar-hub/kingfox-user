"use client";
import styles from "./campaigns.module.css";
import {
  Ticket,
  Calendar,
  MapPin,
  Tag,
  Package,
  ShoppingBag,
  ExternalLink,
  Instagram,
  Store,
  Warehouse,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getCampaignById } from "@/services/luckyDraw.service";
import { useParams, useRouter } from "next/navigation";

/* ── Constants ──────────────────────────────── */
const INSTAGRAM_URL = "https://www.instagram.com/kingfoxclothingstore/";

/* ── Helpers ────────────────────────────────── */
const formatDateShort = (date: string) => {
  if (!date) return "";
  const d = new Date(date);
  const month = d
    .toLocaleString("en-US", { month: "short", timeZone: "UTC" })
    .toUpperCase();
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${month} ${day}`;
};

const formatDateFull = (date: string) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

const getStatusConfig = (status: string) => {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return {
        label: "ACTIVE",
        icon: <CheckCircle2 size={13} />,
        cls: styles.statusActive,
      };
    case "CLOSED":
      return {
        label: "CLOSED",
        icon: <XCircle size={13} />,
        cls: styles.statusClosed,
      };
    case "UPCOMING":
      return {
        label: "UPCOMING",
        icon: <Clock size={13} />,
        cls: styles.statusUpcoming,
      };
    default:
      return {
        label: status ?? "UNKNOWN",
        icon: <AlertCircle size={13} />,
        cls: styles.statusClosed,
      };
  }
};

/* ── Routing: resolves where CLAIM NOW should go ── */
const resolveClaimRoute = (campaign: any): string => {
  return "/products";
};

/* ── Component ──────────────────────────────── */
export default function CampaignPage() {
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    const campaignId = Number(idParam);
    if (!campaignId || Number.isNaN(campaignId)) return;
    (async () => {
      setLoading(true);
      const data = await getCampaignById(campaignId);
      setCampaign(data);
      setLoading(false);
    })();
  }, [idParam]);

  /* ── Claim handler ──────────────────────────── */
  const handleClaim = () => {
    if (!campaign || isClosed) return;
    router.push(resolveClaimRoute(campaign));
  };

  /* ── Derived ─────────────────────────────────── */
  const isClosed = campaign?.status?.toUpperCase() === "CLOSED";

  const progressPercent = campaign
    ? Math.min(
        100,
        Math.round(
          (campaign.vouchersIssued / campaign.totalVouchersLimit) * 100,
        ),
      )
    : 0;

  const statusCfg = getStatusConfig(campaign?.status ?? "");

  const filterLabel = (() => {
    const ft = campaign?.filterType?.toUpperCase();
    if (ft === "CATEGORY" && campaign?.categories?.length)
      return campaign.categories.map((c: any) => c.name).join(", ");
    if (ft === "TAG" && campaign?.tags?.length)
      return campaign.tags.map((t: any) => t.name).join(", ");
    if (ft === "PRODUCT" && campaign?.products?.length)
      return `${campaign.products.length} product(s)`;
    return null;
  })();

  /* ── Skeleton ───────────────────────────────── */
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.heroSkeleton} />
        <main className={styles.container}>
          <div className={styles.pageHeaderSkeleton} />
          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonBlock} style={{ height: 240 }} />
            <div className={styles.skeletonBlock} style={{ height: 240 }} />
          </div>
          <div
            className={styles.skeletonBlock}
            style={{ height: 100, marginTop: 24 }}
          />
        </main>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.notFound}>
          <AlertCircle size={40} />
          <p>Campaign not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* ── Hero — image only, no text overlay ── */}
      <header className={styles.hero}>
        {campaign.image?.endsWith(".mp4") ? (
          <video autoPlay muted loop playsInline className={styles.heroImage}>
            <source src={campaign.image} type="video/mp4" />
          </video>
        ) : (
          <img
            src={campaign.image}
            alt={campaign.name}
            className={styles.heroImage}
          />
        )}
      </header>

      {/* ── Main Content ── */}
      <main className={styles.container}>
        {/* ── Page Header (moved out of hero) ── */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderTop}>
            <span className={styles.tag}>LUCKY DRAW CAMPAIGN 2026</span>
            <span className={`${styles.statusPill} ${statusCfg.cls}`}>
              {statusCfg.icon}
              {statusCfg.label}
            </span>
          </div>

          <h1 className={styles.mainTitle}>{campaign.name?.toUpperCase()}</h1>

          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <Ticket size={15} className={styles.icon} />
              LIMIT: {campaign.totalVouchersLimit} VOUCHERS
            </div>
            <div className={styles.metaItem}>
              <Calendar size={15} className={styles.icon} />
              {formatDateShort(campaign.startDate)} —{" "}
              {formatDateShort(campaign.endDate)}
            </div>
            {campaign.priority && (
              <div className={styles.metaItem}>
                <AlertCircle size={15} className={styles.icon} />
                PRIORITY {campaign.priority}
              </div>
            )}
          </div>
        </div>

        {/* ── Content Grid ── */}
        <div className={styles.contentGrid}>
          {/* ── Left Column ── */}
          <section className={styles.missionCard}>
            <h2 className={styles.sectionTitle}>MISSION BRIEF</h2>
            <p className={styles.description}>{campaign.description}</p>

            {filterLabel && (
              <div className={styles.filterBadge}>
                {campaign.filterType?.toUpperCase() === "CATEGORY" && (
                  <ShoppingBag size={14} />
                )}
                {campaign.filterType?.toUpperCase() === "TAG" && (
                  <Tag size={14} />
                )}
                {campaign.filterType?.toUpperCase() === "PRODUCT" && (
                  <Package size={14} />
                )}
                <span>
                  {campaign.filterType?.toUpperCase()}: {filterLabel}
                </span>
              </div>
            )}

            {(campaign.minPurchaseAmount || campaign.maxPurchaseAmount) && (
              <div className={styles.purchaseLimits}>
                <h3 className={styles.subTitle}>PURCHASE REQUIREMENT</h3>
                <div className={styles.limitRow}>
                  {campaign.minPurchaseAmount && (
                    <div className={styles.limitItem}>
                      <label>MIN AMOUNT</label>
                      <p>₹{campaign.minPurchaseAmount}</p>
                    </div>
                  )}
                  {campaign.maxPurchaseAmount && (
                    <div className={styles.limitItem}>
                      <label>MAX AMOUNT</label>
                      <p>₹{campaign.maxPurchaseAmount}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(campaign.maxVoucherUsageCount || campaign.perUserUsageLimit) && (
              <div className={styles.purchaseLimits}>
                <h3 className={styles.subTitle}>USAGE LIMITS</h3>
                <div className={styles.limitRow}>
                  {campaign.maxVoucherUsageCount && (
                    <div className={styles.limitItem}>
                      <label>MAX VOUCHER USES</label>
                      <p>{campaign.maxVoucherUsageCount}</p>
                    </div>
                  )}
                  {campaign.perUserUsageLimit && (
                    <div className={styles.limitItem}>
                      <label>PER USER LIMIT</label>
                      <p>{campaign.perUserUsageLimit}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {campaign.categories?.length > 0 && (
              <div className={styles.tagsSection}>
                <h3 className={styles.subTitle}>CATEGORIES</h3>
                <div className={styles.tagsList}>
                  {campaign.categories.map((cat: any) => (
                    <span key={cat.id} className={styles.tagChip}>
                      <ShoppingBag size={11} /> {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {campaign.tags?.length > 0 && (
              <div className={styles.tagsSection}>
                <h3 className={styles.subTitle}>TAGS</h3>
                <div className={styles.tagsList}>
                  {campaign.tags.map((tag: any) => (
                    <span key={tag.id} className={styles.tagChip}>
                      <Tag size={11} /> {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {campaign.products?.length > 0 && (
              <div className={styles.tagsSection}>
                <h3 className={styles.subTitle}>ELIGIBLE PRODUCTS</h3>
                <div className={styles.tagsList}>
                  {campaign.products.map((p: any) => (
                    <span key={p.id} className={styles.tagChip}>
                      <Package size={11} /> {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── Right Column ── */}
          <aside className={styles.sidebar}>
            <button
              className={`${styles.claimButton} ${isClosed ? styles.claimDisabled : ""}`}
              onClick={handleClaim}
              disabled={isClosed}
            >
              <span className={styles.btnText}>
                {isClosed ? "CAMPAIGN CLOSED" : "CLAIM NOW"}
              </span>
              <span className={styles.btnSubtext}>
                {isClosed ? "THIS DRAW HAS ENDED" : "ONE-TIME ENTRY ONLY"}
              </span>
            </button>

            <div className={styles.availabilityCard}>
              <h3 className={styles.sidebarLabel}>AVAILABILITY</h3>
              <div className={styles.capacityHeader}>
                <p>TOTAL CAPACITY</p>
                <div className={styles.capacityAmount}>
                  {campaign.totalVouchersLimit}
                  <span className={styles.unit}>VOUCHERS</span>
                </div>
              </div>

              <div className={styles.issuedRow}>
                <span>ISSUED</span>
                <strong>{campaign.vouchersIssued}</strong>
              </div>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className={styles.progressLabel}>
                {progressPercent}% CLAIMED
              </div>

              <div className={styles.branchesSection}>
                <h3 className={styles.sidebarLabel}>ELIGIBLE BRANCHES</h3>
                {campaign.branches?.length > 0 ? (
                  campaign.branches.map((branch: any) => (
                    <div key={branch.id} className={styles.branchItem}>
                      <div className={styles.branchIcon}>
                        {branch.type === "SHOP" ? (
                          <Store size={12} />
                        ) : (
                          <Warehouse size={12} />
                        )}
                      </div>
                      <div className={styles.branchInfo}>
                        <span className={styles.branchName}>
                          {branch.name.toUpperCase()}
                        </span>
                        <span className={styles.branchAddress}>
                          <MapPin size={10} /> {branch.address}
                        </span>
                      </div>
                      {branch.supportsPickup && (
                        <span className={styles.pickupBadge}>PICKUP</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className={styles.noBranches}>No branches assigned</p>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* ── Timeline ── */}
        <section className={styles.timelineCard}>
          <h3 className={styles.timelineTitle}>CAMPAIGN TIMELINE</h3>
          <div className={styles.timelineRow}>
            <div className={styles.timePoint}>
              <label>LAUNCH</label>
              <p>{formatDateFull(campaign.startDate)}</p>
            </div>
            <div className={styles.timelineLine}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineBar}>
                <div
                  className={styles.timelineBarFill}
                  style={{
                    width: (() => {
                      const now = Date.now();
                      const start = new Date(campaign.startDate).getTime();
                      const end = new Date(campaign.endDate).getTime();
                      if (now <= start) return "0%";
                      if (now >= end) return "100%";
                      return `${Math.round(((now - start) / (end - start)) * 100)}%`;
                    })(),
                  }}
                />
              </div>
              <div className={styles.timelineDot} />
            </div>
            <div className={styles.timePoint}>
              <label>EXPIRY</label>
              <p>{formatDateFull(campaign.endDate)}</p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Subscribe Section ── */}
      <section className={styles.subscribeSection}>
        <div className={styles.subscribeContainer}>
          <h2 className={styles.subscribeTitle}>
            NEVER MISS <br /> A DROP AGAIN
          </h2>
          <div className={styles.subscribeForm}>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className={styles.subscribeBtn}
            >
              <Instagram size={18} />
              FOLLOW ON INSTAGRAM
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
