export type Department = {
  id: number;
  code: string;
  name: string;
  description: string;
};

export type DepartmentRequest = { code: string; name: string; description: string };

export type DepartmentUpdateRequest = Partial<DepartmentRequest>;