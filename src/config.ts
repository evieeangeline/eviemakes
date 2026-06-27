export const social = {
  linkedin: "https://www.linkedin.com/in/evangeline-sturges",
  instagram: "https://www.instagram.com/the_little_evie_workshop/",
};

export type HomeBlock = {
  image: string;
  alt: string;
  href?: string;
  answer?: string;
};

export const homeBlocks: HomeBlock[] = [
  { image: '/images/home/fih crop.png', alt: 'lace fish',        href: '/wip', answer: 'LACE FISH' },
  { image: '/images/home/ball.png',     alt: 'pool ball',         href: '/wip', answer: 'POOL GAMES' },
  { image: '/images/home/boat.png',     alt: 'water bottle boat', href: '/wip', answer: 'WATER BOTTLE BOAT' },
];
