export type Category = {
  id: number;
  name: string;
  description: string;
};

export type CategoryRequest = { name: string; description: string };

export type CategoryUpdateRequest = Partial<CategoryRequest>;