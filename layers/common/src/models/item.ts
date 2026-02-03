export interface Item {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateItemInput {
  name: string;
  description?: string;
}

export interface ItemRecord extends Item {
  pk: string;
  sk: string;
}
