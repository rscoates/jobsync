"use server";
import prisma from "@/lib/db";
import { handleError } from "@/lib/utils";
import { getCurrentUser } from "@/utils/user.utils";

export const getAllJobSources = async (): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }
    return prisma.jobSource.findMany();
  } catch (error) {
    const msg = "Failed to fetch job source list. ";
    return handleError(error, msg);
  }
};


export const getJobSourceList = async (): Promise<any | undefined> => {
  try {
    const list = await prisma.jobSource.findMany();
    return list;
  } catch (error) {
    const msg = "Failed to fetch job source list. ";
    return handleError(error, msg);
  }
};

export const createJobSource = async (
  label: string
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const value = label.trim().toLowerCase();

    const upsertedSource = await prisma.jobSource.upsert({
      where: { value },
      update: { label },
      create: { label, value },
    });

    return upsertedSource;
  } catch (error) {
    const msg = "Failed to create job source. ";
    return handleError(error, msg);
  }
};

export const deleteJobSourceById = async (
  jobSourceId: string
): Promise<any | undefined> => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const jobs = await prisma.job.count({
      where: {
        jobSourceId,
      },
    });

    if (jobs > 0) {
      throw new Error(
        `Job source cannot be deleted due to ${jobs} number of associated jobs! `
      );
    }

    const res = await prisma.jobSource.delete({
      where: {
        id: jobSourceId,
      },
    });
    return { res, success: true };
  } catch (error) {
    const msg = "Failed to delete job source.";
    return handleError(error, msg);
  }
};
