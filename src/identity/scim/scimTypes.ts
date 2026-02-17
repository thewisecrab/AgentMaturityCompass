export interface ScimListResponse<T> {
  schemas: string[];
  totalResults: number;
  Resources: T[];
  startIndex: number;
  itemsPerPage: number;
}

export function scimListResponse<T>(resources: T[], startIndex = 1, totalResults = resources.length): ScimListResponse<T> {
  return {
    schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
    totalResults,
    Resources: resources,
    startIndex,
    itemsPerPage: resources.length
  };
}

export function scimError(status: number, detail: string): {
  schemas: string[];
  status: string;
  detail: string;
} {
  return {
    schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
    status: String(status),
    detail
  };
}
