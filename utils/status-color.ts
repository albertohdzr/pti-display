export const getStatusColor = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "default";
    case "PENDING_APPROVAL":
      return "warning";
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    case "CANCELLED":
      return "default";
    default:
      return "default";
  }
};
