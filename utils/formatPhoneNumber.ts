export const formatPhoneNumber = (phone: string) => {
  return phone.replace(/(\+\d+?)0?/, "$1");
};

