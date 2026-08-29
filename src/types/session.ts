export type SessionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type Session = {
  id: number;
  code: string;
  location: string;
  status: SessionStatus;
  startedAt: string;
  endedAt?: string;
  
};

export type SessionCreateRequest = {
  code: string;
  location: string;
  coordinatorCodes: string[]
}