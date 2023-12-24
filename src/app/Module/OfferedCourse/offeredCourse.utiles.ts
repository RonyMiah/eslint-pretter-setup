import { TSchadule } from './offeredCourse.interface';

export const hasTimeConflict = (
  assignedSchedules: TSchadule[],
  newSchedules: TSchadule,
) => {
  //forEatch or map era contineously choltei thake loop gorabe jei porjonto length thakbe ,, ses hower pore aber last aa jodi return thake tahole seita return kore dibe er jonno for loop use korte hobe
//map ba foreatch brack kaj kore na  er jonno for of loop use korse 

  for (const schedule of assignedSchedules) {
    const existingStartTime = new Date(`1970-01-01T${schedule.startTime}`);
    const existingEndTime = new Date(`1970-01-01T${schedule.endTime}`);
    const newStartTime = new Date(`1970-01-01T${newSchedules.startTime}`);
    const newEndTime = new Date(`1970-01-01T${newSchedules.endTime}`);

    //at a time one person attend one class validation
    //10:30 - 12:30 //existingTime
    //11:30 - 1:30  //newTime
    if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
      return true;
    }
  }

  return false;
};
