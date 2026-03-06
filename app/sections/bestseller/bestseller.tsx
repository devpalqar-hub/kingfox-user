import React from 'react';
import ProductCard from '@/components/productcard/productcard';
import styles from './bestseller.module.css';

const Bestseller = () => {

  const products = [
  { id: 1, name: "Noir Oversized Tee", price: "1,499.00", rating: 4.9, image: "/productcard1.png" },
  { id: 2, name: "Noir Oversized Tee", price: "1,499.00", rating: 4.9, image: "/productcard1.png" },
  { id: 3, name: "Noir Oversized Tee", price: "1,499.00", rating: 4.9, image: "/productcard1.png" },
  { id: 4, name: "Noir Oversized Tee", price: "1,499.00", rating: 4.9, image: "/productcard1.png" },
];

  return (
    <section className={styles.section}>

      <div className={styles.header}>
        <h2 className={styles.title}>BESTSELLER</h2>
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            rating={product.rating}
            image={product.image}
          />
        ))}
      </div>

      <div className={styles.viewAllWrapper}>
        <button className={styles.viewAll}>VIEW ALL PRODUCTS</button>
      </div>

    </section>
  );
};

export default Bestseller;