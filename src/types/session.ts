export type SessionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type Session = {
  id: number;
  code: string;
  location: string;
  status: SessionStatus;
  startedAt: string | null;
  endedAt: string | null;
  
};

export type SessionCreateRequest = {
  code: string;
  location: string;
  coordinatorCodes: string[]
}

export type SessionUpdateRequest = { status: SessionStatus };