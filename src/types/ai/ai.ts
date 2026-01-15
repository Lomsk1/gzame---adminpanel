export interface AIInstructionType {
  status: "success";
  fromCache: false;
  total: 0;
  result: 0;
  data: [
    {
      _id: string;
      text: string;
      updated_at: Date;
      created_at: Date;
    }
  ];
}
