export type LocalGuardian = {
  name: string;
  occupation: string;
  contactNo: string;
  address: string;
};
export type Student = {
  name: string;
  age: number;
  address: string;
  gender: 'maile' | 'femaile';
  localGuardian: LocalGuardian;
  bladGroup?: 'A+' | 'B+' | 'AB+' | 'O+';
  isActive: 'active' | 'inactive';
};
