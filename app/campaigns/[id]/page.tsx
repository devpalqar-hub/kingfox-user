"use client";
import styles from "./campaigns.module.css";
import { Ticket, Calendar } from "lucide-react";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { getCampaignById } from "@/services/luckyDraw.service";
import { useParams } from "next/navigation";
export default function CampaignPage() {
  const [campaign, setCampaign] = useState<any>(null);
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const formatDate = (date: string) => {
    if (!date) return "";

    const d = new Date(date);

    const month = d
      .toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC", // 🔥 FIX
      })
      .toUpperCase();

    const day = String(
      d.getUTCDate(), // 🔥 FIX
    ).padStart(2, "0");

    return `${month} ${day}`;
  };

  useEffect(() => {
    const campaignId = Number(idParam);
    if (!campaignId || Number.isNaN(campaignId)) return;

    const fetchCampaign = async () => {
      const data = await getCampaignById(campaignId);
      setCampaign(data);
    };

    fetchCampaign();
  }, [idParam]);
  return (
    <div className={styles.wrapper}>
      {/* Hero Section */}
      <header
        className={styles.hero}
        style={{
          backgroundImage: `url(${
            campaign?.image?.startsWith("blob")
              ? "https://picsum.photos/1200/400"
              : campaign?.image
          })`,
        }}
      >
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            {" "}
            {/* ✅ CHANGE */}
            <span className={styles.tag}>LUCKY DRAW CAMPAIGN 2026</span>
            <h1 className={styles.mainTitle}>
              {campaign?.name?.toUpperCase() || "LOADING..."}
            </h1>
            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <Ticket size={16} className={styles.icon} />
                LIMIT: {campaign?.totalVouchersLimit || 0} VOUCHERS
              </div>

              <div className={styles.metaItem}>
                <Calendar size={16} className={styles.icon} />

                {campaign?.startDate && campaign?.endDate
                  ? `${formatDate(campaign.startDate)} - ${formatDate(campaign.endDate)}`
                  : "LOADING..."}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className={styles.container}>
        <div className={styles.contentGrid}>
          {/* Left Column */}
          <section className={styles.missionCard}>
            <h2 className={styles.sectionTitle}>MISSION BRIEF</h2>
            <p className={styles.description}>{campaign?.description}</p>

            <ul className={styles.list}>
              <li>
                <span className={styles.dot}>•</span>{" "}
                <strong>GRAND PRIZE:</strong> KINGFOX NEON KINETIC SERIES
                (COMPLETE SET)
              </li>
              <li>
                <span className={styles.dot}>•</span>{" "}
                <strong>SECONDARY PRIZES:</strong> LIMITED RELEASE VOUCHERS &
                ARCHIVE ACCESS
              </li>
            </ul>
          </section>

          {/* Right Column */}
          <aside className={styles.sidebar}>
            <button className={styles.claimButton}>
              <span className={styles.btnText}>CLAIM NOW</span>
              <span className={styles.btnSubtext}>ONE-TIME ENTRY ONLY</span>
            </button>

            <div className={styles.availabilityCard}>
              <h3 className={styles.sidebarLabel}>AVAILABILITY</h3>
              <div className={styles.capacityHeader}>
                <p>TOTAL CAPACITY</p>
                <div className={styles.capacityAmount}>
                  {campaign?.totalVouchersLimit || 0}{" "}
                  <span className={styles.unit}>VOUCHERS</span>
                </div>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: campaign
                      ? `${(campaign.vouchersIssued / campaign.totalVouchersLimit) * 100}%`
                      : "0%",
                  }}
                ></div>
              </div>

              <div className={styles.branchesSection}>
                <h3 className={styles.sidebarLabel}>ELIGIBLE BRANCHES</h3>

                {campaign?.branches && campaign.branches.length > 0 ? (
                  campaign.branches.map((branch: any) => (
                    <div key={branch.id} className={styles.branchItem}>
                      <MapPin size={14} />
                      {branch.name.toUpperCase()}
                    </div>
                  ))
                ) : (
                  <p className={styles.noBranches}>No branches available</p>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Timeline Footer */}
        <section className={styles.timelineCard}>
          <h3 className={styles.timelineTitle}>CAMPAIGN TIMELINE</h3>
          <div className={styles.timelineRow}>
            <div className={styles.timePoint}>
              <label>LAUNCH</label>
              <p>
                {campaign?.startDate
                  ? new Date(campaign.startDate).toISOString().split("T")[0]
                  : "2025-04-01"}
              </p>
            </div>
            <div className={styles.timelineLine}>
              <span className={styles.arrow}>→</span>
            </div>
            <div className={styles.timePoint}>
              <label>EXPIRY</label>
              <p>
                {campaign?.endDate
                  ? new Date(campaign.endDate).toISOString().split("T")[0]
                  : "2025-07-31"}
              </p>
            </div>
          </div>
        </section>
      </main>
      <section className={styles.subscribeSection}>
        <div className={styles.subscribeContainer}>
          {/* LEFT TEXT */}
          <h2 className={styles.subscribeTitle}>
            NEVER MISS <br /> A DROP AGAIN
          </h2>

          {/* RIGHT INPUT */}
          <div className={styles.subscribeForm}>
            <input
              type="email"
              placeholder="ENTER EMAIL"
              className={styles.input}
            />
            <button className={styles.subscribeBtn}>SUBSCRIBE</button>
          </div>
        </div>
      </section>
    </div>
  );
}
