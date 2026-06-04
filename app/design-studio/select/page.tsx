"use client";

import { useRouter } from 'next/navigation';
import { Shirt } from 'lucide-react';
import { useDesignStore } from '@/stores/design-studio/useDesignStore';
import styles from './page.module.css';

const categories = [
  {
    id: 'oversized-tee',
    name: 'Oversized Premium Tee',
    description: 'Heavyweight cotton, relaxed drop-shoulder fit.',
    basePrice: 599,
  },
  {
    id: 'classic-hoodie',
    name: 'Classic Pullover Hoodie',
    description: 'Ultra-soft fleece inner, perfect for bold graphics.',
    basePrice: 1299,
  },
  {
    id: 'crewneck-sweatshirt',
    name: 'Crewneck Sweatshirt',
    description: 'Versatile daily wear with a comfortable fit.',
    basePrice: 1099,
  },
];

export default function ApparelSelection() {
  const router = useRouter();
  const setApparelCategory = useDesignStore((state) => state.setApparelCategory);

  const handleSelect = (categoryId: string) => {
    setApparelCategory(categoryId);
    // Navigate to a new workspace (using a mock ID for now)
    const newProjectId = `proj_${Date.now()}`;
    router.push(`/design-studio/workspace/${newProjectId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Choose Your Canvas</h1>
        <p className={styles.subtitle}>Select the apparel type you want to customize.</p>
      </div>

      <div className={styles.grid}>
        {categories.map((category) => (
          <div 
            key={category.id} 
            className={styles.card}
            onClick={() => handleSelect(category.id)}
          >
            <div className={styles.imagePlaceholder}>
              <Shirt size={80} color="#333" strokeWidth={1} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{category.name}</h3>
              <p className={styles.cardDesc}>{category.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.price}>Starts at ₹{category.basePrice}</span>
                <button className={styles.selectBtn}>Select</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
