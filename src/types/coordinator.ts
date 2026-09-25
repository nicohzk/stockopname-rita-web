export type CoordinatorStatus = "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED" | "CANCELLED";

export type Coordinator = {
  id: number;
  code: string;
  inspector: number;
  rackAssigned: number;
  rackFinished: number;
  status: CoordinatorStatus;
  sessionCode?: string;
  sessionLocation?: string;
};

export type CoordinatorUpdateRequest = { status: CoordinatorStatus };
