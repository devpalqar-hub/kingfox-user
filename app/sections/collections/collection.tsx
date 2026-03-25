'use client';

import React from "react";
import Image from "next/image";
import styles from "./collection.module.css";
import { useRouter } from 'next/navigation';

const Collections = () => {
  const router = useRouter();
  return (
    <section className={styles.wrapper}>
      <div className={styles.blackContainer}>

        {/* Header */}
        <div className={styles.topTabContainer}>
          <div className={styles.headerTab}>
            <h2>COLLECTIONS</h2>
            <div className={styles.curveLeft}></div>
            <div className={styles.curveRight}></div>
          </div>
        </div>

        {/* DESKTOP GRID */}
        <div className={styles.desktopGrid}>
          
          <div className={styles.card}>
            <Image src="/half-sleeve.png" alt="" fill className={`${styles.img} ${styles.imgHalfSleeve}`} />
            <div className={styles.label}>HALF SLEEVE T-SHIRTS</div>
          </div>

          <div className={`${styles.card} ${styles.newArrival}`}>
            <Image src="/new-arrival.png" alt="" fill className={`${styles.img} ${styles.imgNewArrival}`} />
            <div className={styles.label}>NEW ARRIVAL</div>
          </div>

          <div className={styles.card}>
            <Image src="/full-sleeve.png" alt="" fill className={`${styles.img} ${styles.imgFullSleeve}`} />
            <div className={styles.label}>FULL SLEEVE T-SHIRTS</div>
          </div>

          <div className={styles.card}>
            <Image src="/oversize.png" alt="" fill className={`${styles.img} ${styles.imgOversize}`} />
            <div className={styles.label}>OVERSIZE TEE</div>
          </div>

          <div className={styles.card}>
            <Image src="/shirts.png" alt="" fill className={`${styles.img} ${styles.imgShirts}`} />
            <div className={styles.label}>SHIRTS</div>
          </div>

        </div>


      
        <div className={styles.mobileGrid}>
         <div className={styles.cardrow}>
          <div className={styles.card}>
            <Image src="/oversize.png" alt="" fill className={`${styles.img} ${styles.imgOversize}`} />
            <div className={styles.label}>OVERSIZE TEE</div>
          </div>

          <div className={styles.card}>
            <Image src="/shirts.png" alt="" fill className={`${styles.img} ${styles.imgShirts}`} />
            <div className={styles.label}>SHIRTS</div>
          </div>
        </div>

          <div className={`${styles.card} ${styles.mobileNewArrival}`}>
            <Image src="/new-arrival.png" alt="" fill className={`${styles.img} ${styles.imgNewArrival}`} />
            <div className={styles.label}>NEW ARRIVAL</div>
          </div>
          
          <div  className={styles.cardrow}>
            <div className={styles.card}>
                <Image src="/half-sleeve.png" alt="" fill className={`${styles.img} ${styles.imgHalfSleeve}`} />
                <div className={styles.label}>HALF SLEEVE T-SHIRTS</div>
            </div>

            <div className={styles.card}>
                <Image src="/full-sleeve.png" alt="" fill className={`${styles.img} ${styles.imgFullSleeve}`} />
                <div className={styles.label}>FULL SLEEVE T-SHIRTS</div>
            </div>
        </div>
    </div>




        {/* Button */}
        <div className={styles.bottomTabContainer}>
          <div className={styles.footerTab}>
            <button onClick={() => router.push('/products')} className={styles.viewBtn}>VIEW ALL PRODUCTS</button>
            <div className={styles.curveLeftBottom}></div>
            <div className={styles.curveRightBottom}></div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Collections;