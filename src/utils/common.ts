const getNormPhone = (phone: string) => {
  try {
    phone = phone.toString().replace(/[^\d+]+/g, "");
    phone = phone.replace(/^00/, "+");
    if (phone.match(/^1/)) phone = "+" + phone;
    phone = phone.replace(/^\+/, "");
  } catch (err) {
    console.log(phone);
    console.log(err);
  }
  return phone;
};

const getNormNIC = (nic: string) => {
  nic = nic.toString().replace(/[^\d+]+/g, "");
  nic = nic.replace(/^\+/, "");
  return nic;
};

const validateValue = (str: string) => {
  return ((str == "") || (str == "NULL") || (str == null));
};

const getStatus = (str: string) => {
  let bol = 0;
  switch (str) {
    case "ACTIVATED":
      bol = 0;
      break;
    case "DEACTIVATED":
      bol = 1;
      break;
    case "ISSUE":
      bol = 2;
      break;
    default:
      bol = 0;
      break;
  }
  return bol;
};

const isInsurancePolicy = (str: string) => {
  return (str == "Yes" ? 1 : 0);
};

const getDate = (str: string) => {
  return new Date(str).toString() !== 'Invalid Date' ? new Date(str) : null;
};



export default { getNormPhone, getNormNIC, validateValue, getStatus, isInsurancePolicy, getDate };