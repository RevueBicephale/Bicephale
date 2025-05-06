// /pages/categories/[category].tsx
import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { getArticleData } from '../../lib/articleService';
import { categoryConfigMap, categoryToSlug } from '../../config/category';
import SharedCategoryPage from '../../app/components/shared';
import { Article } from '../../types';
import Header, { Category } from '../../app/components/header';

interface CategoryEntryProps {
  category: string;
  articles: Article[];
  categories: Category[];
}

export default function CategoryEntry({ category, articles, categories }: CategoryEntryProps) {
  const router = useRouter();
  const slug = router.query.category as string;
  
  // Find the actual category name from the slug
  const categoryName = Object.keys(categoryConfigMap).find(
    catName => categoryToSlug(catName) === slug
  ) || category;
  
  const config = categoryConfigMap[categoryName];

  if (!config) return <div>Catégorie introuvable.</div>;

  // Check if this category should be handled by a specific page
  // If it has a linkTo property and it's not the current path, redirect to that page
  if (config.linkTo && typeof window !== 'undefined') {
    const currentPath = router.asPath;
    const targetPath = config.linkTo;
    
    // Only redirect if we're not already on the target page
    if (!currentPath.includes(targetPath)) {
      router.push(targetPath);
      return <div>Redirection...</div>;
    }
  }

  // Otherwise use the shared page component
  return <SharedCategoryPage category={categoryName} articles={articles} />;
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate paths for categories that should use the shared component
  const paths = Object.keys(categoryConfigMap)
    .filter(category => !categoryConfigMap[category].linkTo)
    .map(category => ({
      params: { category: categoryToSlug(category) },
    }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { articles, categories } = getArticleData();
  const slug = params?.category as string;
  
  // Find category name from slug
  const categoryName = Object.keys(categoryConfigMap).find(
    catName => categoryToSlug(catName) === slug
  );
  
  // If no matching category found, return empty array
  if (!categoryName) {
    return {
      props: { category: slug, articles: [], categories },
    };
  }

  // Filter articles by category
  const filteredArticles = articles.filter(a => a.category === categoryName);
  
  return {
    props: { 
      category: categoryName, 
      articles: filteredArticles,
      categories 
    },
  };
};



/*

// /pages/categories/[category].tsx
import React, { useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { getArticleData } from '../../lib/articleService';
import { categoryConfigMap } from '../../config/categoryColors';
import SharedCategoryPage from '../../app/components/shared';
import { Article } from '../../types'; // Ensure you import your Article type
import Header, { Category } from '../../app/components/Header';




interface CategoryEntryProps {
  category: string;
  articles: Article[];
}

export default function CategoryEntry({ category, articles }: CategoryEntryProps) {
  const config = categoryConfigMap[category];

  if (!config) return <div>Catégorie introuvable.</div>;

  const usesSharedPage = ['Love Letters', 'Bascule', 'Sensure', 'Banque des rêves', 'Cartographie'].includes(category);

  if (usesSharedPage) {
    return <SharedCategoryPage category={category} articles={articles} />;
  }
  
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(articles);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const handleCategoryChange = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      setFilteredArticles(articles);
      setBackgroundColor('#ffffff');
    } else {
      setActiveCategory(category);
      setFilteredArticles(articles.filter((a) => a.category === category));
      setBackgroundColor('#ffffff');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: config.color }}>{category}</h1>
      {config.media.map((src, i) => (
        <img key={i} src={src} alt={`Media ${i}`} style={{ maxWidth: '100%', marginBottom: '1rem' }} />
      ))}
      <ul>
        {articles.map((a) => (
          <li key={a.slug}>
            <strong>{a.title}</strong> -99- {a.date} by {a.author}
            <p>{a.preview}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: Object.keys(categoryConfigMap).map((category) => ({
      params: { category },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { articles } = getArticleData();
  const category = params?.category as string;
  const filtered = articles.filter((a) => a.category === category);
  return {
    props: { category, articles: filtered },
  };
};





// /pages/categories/[category].tsx
import { GetStaticPaths, GetStaticProps } from 'next';
import { categoryConfigMap } from '../../config/categoryColors';
import { getArticleData } from '../../lib/articleService';
import { Article } from '../../types';

export default function CategoryPage({ category, articles }: { category: string; articles: Article[] }) {
  const config = categoryConfigMap[category];
  if (!config) return <div>Catégorie introuvable.</div>;

  return (
    <div>
      <h1 style={{ color: config.color }}>{category}</h1>
      {config.media.map((src, i) => (
        <img key={i} src={src} alt={`Media ${i}`} />
      ))}
      <ul>
        {articles.map((a) => (
          <li key={a.slug}>{a.title}</li>
        ))}
      </ul>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.keys(categoryConfigMap).map((category) => ({
    params: { category },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const category = typeof params?.category === 'string' ? params.category : null;

  if (!category || !(category in categoryConfigMap)) {
    return { notFound: true };
  }

  const { articles } = getArticleData();
  const filtered = articles.filter((a) => a.category === category);

  return {
    props: {
      category,
      articles: filtered,
    },
  };
};
*/













/*
---
// /pages/categories/[category].tsx
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { getArticleData } from '../../lib/articleService';
import { categoryConfigMap, defaultCategoryColor } from '../../config/categoryColors';
import Head from 'next/head';

type Props = {
  category: string;
  articles: { title: string; slug: string; date: string; preview: string }[];
  color: string;
  media: string[];
};

export default function CategoryPage({ category, articles, color, media }: Props) {
  const router = useRouter();
  if (router.isFallback) return <div>Loading...</div>;

  return (
    <>
      <Head>
        <title>{category} – BICÉPHALE</title>
      </Head>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ color, fontSize: '2rem', marginBottom: '1rem' }}>{category}</h1>

        {media.length > 0 && (
          <div className="media-header">
            {media.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${category} media ${i + 1}`}
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', marginBottom: '1rem' }}
              />
            ))}
          </div>
        )}

        <ul>
          {articles.map((a) => (
            <li key={a.slug} style={{ marginBottom: '1rem' }}>
              <a href={`/articles/${a.slug}`} style={{ color: color, fontWeight: 500 }}>{a.title}</a>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>{a.date}</div>
              <div style={{ fontSize: '0.9rem' }}>{a.preview}</div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: Object.keys(categoryConfigMap).map((category) => ({
      params: { category },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { category } = params as { category: string };
  const config = categoryConfigMap[category];
  if (!config) return { notFound: true };

  const { articles } = getArticleData();
  const filtered = articles.filter((a) => a.category === category);

  return {
    props: {
      category,
      articles: filtered,
      color: config.color || defaultCategoryColor,
      media: config.media || [],
    },
  };
};
*/