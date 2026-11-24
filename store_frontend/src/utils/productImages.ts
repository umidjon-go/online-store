import { Product } from '../types';

export const getProductImageUrl = (p: Product): string => {
  if (p.image_url && p.image_url.trim().length > 0) {
    return p.image_url;
  }
  const name = (p.name || '').toLowerCase();
  if (name.includes('iphone') || name.includes('apple phone')) {
    return 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('samsung') || name.includes('galaxy')) {
    return 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('macbook') || name.includes('noutbuk') || name.includes('laptop')) {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('airpods') || name.includes('naushnik') || name.includes('earbuds') || name.includes('headphone')) {
    return 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('tv') || name.includes('televizor')) {
    return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('muzlatgich') || name.includes('refrigerator') || name.includes('artel')) {
    return 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('kostyum') || name.includes('kiyim') || name.includes('ko\'ylak')) {
    return 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('nike') || name.includes('krossovka') || name.includes('oyoq kiyim')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('sut') || name.includes('milk') || name.includes('ichimlik')) {
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('qahva') || name.includes('kofe') || name.includes('coffee')) {
    return 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('qalam') || name.includes('kitob') || name.includes('daftar')) {
    return 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80';
  }
  // Category based fallbacks
  switch (p.category_id) {
    case 1:
      return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80';
    case 2:
      return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80';
    case 3:
      return 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80';
    case 4:
      return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
    case 5:
      return 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80';
    default:
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80';
  }
};

