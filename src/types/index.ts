export type Group = [
  {
    name: string;
    usages: string;
  },
  {
    name: string;
    sideEffects: string;
  },
];

export type Error = {
  message?: string;
};

export type Language = 'vi' | 'en';
