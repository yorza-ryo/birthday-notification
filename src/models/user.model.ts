export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  anniversaryDate?: Date;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface IScheduledTask {
  id: string;
  userId: string;
  user: string;
  type: Type;
  status: Status;
  scheduledAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type Type = {
  BIRTHDAY: string;
  ANNIVERSARY: string;
};

export type Status = {
  PENDING: string;
  SENT: string;
  FAILED: string;
  RETRYING: string;
  SCHEDULED: string;
};
