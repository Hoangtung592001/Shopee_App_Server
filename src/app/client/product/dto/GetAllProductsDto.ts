export class FindAllMemberModelDto {
  pageIndex: number;
  pageSize: number;
  skip: number;
}

export interface loadMoreFindAllMemberModelDto {
  takeAfter: number;
  pageSize: number;
}

export interface TypeProducts {
  type: number;
}
