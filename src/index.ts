import "reflect-metadata";
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const Fs = require('fs');
const CsvReadableStream = require('csv-reader');
import commonUtil from "../src/utils/common";

/*
SELECT 
c.doctorid as id, 
c.SPECIALITY as specialty_id, 
c.DoctorEarnings as fee, 
p.TitleDescription as title, 
c.MEDSCHOOL as medical_school, 
c.QUALIFICATION as qualification, 
c.FirstName as first_name,
c.LastName as last_name,
c.`E-MAIL` as email,
c.DateOfBirth as dob,
c.REG_ADDRESS as address,
c.PHONE as phone,
c.RegistrationBody as registration_body,
c.SLMCNumber as reg_no,
c.NIC as nic,
c.notes as pre_booking_text,
c.selectConsultationTimeInMinutes as consultation_duration,
s.SIGN as photo_signature,
s.SEAL as photo_seal,
s.PRO_PIC as photo_profile
FROM odoc.doctorregistrationtable c
LEFT JOIN odoc.doctortempregistrationtablepart2 s
ON c.doctorid = s.DoctorID
LEFT JOIN odoc.formtitles p
ON c.TitleID = p.TitleID;
*/

let inputStream = Fs.createReadStream('../Gen2Doctor.csv', 'utf8');
let inputStream2 = Fs.createReadStream('../oDoc Doctors - doctors.csv', 'utf8');
let generalInfo = [];
let bankInfo = [];
let totalInfo = [];

inputStream
  .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
  .on('data', function (row) {

    generalInfo.push({
      id: row[0],
      specialty_id: commonUtil.validateValue(row[1]) ? null : row[1],
      fee: commonUtil.validateValue(row[2]) ? null : row[2],
      title: commonUtil.validateValue(row[3]) ? null : row[3],
      medical_school: commonUtil.validateValue(row[4]) ? null : row[4],
      qualification: commonUtil.validateValue(row[5]) ? null : row[5],
      first_name: commonUtil.validateValue(row[6]) ? null : row[6],
      last_name: commonUtil.validateValue(row[7]) ? null : row[7],
      email: commonUtil.validateValue(row[8]) ? null : row[8],
      dob: commonUtil.validateValue(row[9]) ? null : commonUtil.getDate(row[9]),
      address: commonUtil.validateValue(row[10]) ? null : row[10],
      phone: commonUtil.validateValue(row[11]) ? null : row[11],
      registration_body: commonUtil.validateValue(row[12]) ? null : row[12],
      reg_no: commonUtil.validateValue(row[13]) ? null : row[13],
      nic: commonUtil.validateValue(row[14]) ? null : row[14],
      pre_booking_text: commonUtil.validateValue(row[15]) ? null : row[15],
      consultation_duration: commonUtil.validateValue(row[16]) ? null : row[16],
      photo_signature: commonUtil.validateValue(row[17]) ? null : row[17],
      photo_seal: commonUtil.validateValue(row[18]) ? null : row[18],
      photo_profile: commonUtil.validateValue(row[19]) ? null : row[19]
    });

  })
  .on('end', function () {
    console.log('finished reading csv1');
    readSheet2();
  });


let readSheet2 = () => {
  inputStream2
    .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
    .on('data', function (row) {
      bankInfo.push({
        status: commonUtil.validateValue(row[2]) ? null : commonUtil.getStatus(row[2]),
        comment: commonUtil.validateValue(row[4]) ? null : row[4],
        id: commonUtil.validateValue(row[7]) ? null : row[7],
        bank_acc_name: commonUtil.validateValue(row[25]) ? null : row[25],
        bank_accont_no: commonUtil.validateValue(row[26]) ? null : row[26],
        bank_name: commonUtil.validateValue(row[27]) ? null : row[27],
        branch: commonUtil.validateValue(row[28]) ? null : row[28],
        practice_location: commonUtil.validateValue(row[29]) ? null : row[29],
        is_insurance_policy: commonUtil.validateValue(row[30]) ? 0 : commonUtil.isInsurancePolicy(row[30]),
      });
    })
    .on('end', function () {
      console.log('finished reading csv2');
      combineData();
    });
}

const combineData = async () => {
  let insertArray = [];
  generalInfo.forEach(s => {

    s.status = null;
    s.comment = null;
    s.bank_acc_name = null;
    s.bank_accont_no = null;
    s.bank_name = null;
    s.branch = null;
    s.practice_location = null;
    s.is_insurance_policy = 0;

    let rowObj = [];

    bankInfo.forEach(l => {
      if (s.id == l.id) {
        s.status = l.status;
        s.comment = l.comment;
        s.bank_acc_name = l.bank_acc_name;
        s.bank_accont_no = l.bank_accont_no;
        s.bank_name = l.bank_name;
        s.branch = l.branch;
        s.practice_location = l.practice_location;
        s.is_insurance_policy = l.is_insurance_policy;
      }
    });

    Object.keys(s).forEach(key => {
      console.log(key, s[key]);
      rowObj.push(s[key]);
    })
    totalInfo.push(s);
    insertArray.push(rowObj);

  });

  createSQLtoFile(insertArray);
  createCSV(totalInfo);
}

let createCSV = async (array: any[]) => {
  const csvWriter = createCsvWriter({
    path: 'file.csv',
    header: [
      { id: 'id', title: 'id' },
      { id: 'specialty_id', title: 'specialty_id' },
      { id: 'fee', title: 'fee' },
      { id: 'title', title: 'title' },
      { id: 'medical_school', title: 'medical_school' },
      { id: 'qualification', title: 'qualification' },
      { id: 'bank_acc_name', title: 'bank_acc_name' },
      { id: 'bank_accont_no', title: 'bank_accont_no' },
      { id: 'bank_name', title: 'bank_name' },
      { id: 'branch', title: 'branch' },
      { id: 'package_id', title: 'package_id' },
      { id: 'created_at', title: 'created_at' },
      { id: 'updated_at', title: 'updated_at' },
      { id: 'deleted_at', title: 'deleted_at' },
      { id: 'first_name', title: 'first_name' },
      { id: 'last_name', title: 'last_name' },
      { id: 'email', title: 'email' },
      { id: 'gender', title: 'gender' },
      { id: 'dob', title: 'dob' },
      { id: 'address', title: 'address' },
      { id: 'phone', title: 'phone' },
      { id: 'norm_phone', title: 'norm_phone' },
      { id: 'country_id', title: 'country_id' },
      { id: 'registration_body', title: 'registration_body' },
      { id: 'reg_no', title: 'reg_no' },
      { id: 'nic', title: 'nic' },
      { id: 'norm_nic', title: 'norm_nic' },
      { id: 'practice_location', title: 'practice_location' },
      { id: 'pre_booking_text', title: 'pre_booking_text' },
      { id: 'consultation_duration', title: 'consultation_duration' },
      { id: 'is_on_demand', title: 'is_on_demand' },
      { id: 'photo_signature', title: 'photo_signature' },
      { id: 'photo_nic', title: 'photo_nic' },
      { id: 'photo_medical_licence', title: 'photo_medical_licence' },
      { id: 'photo_profile', title: 'photo_profile' },
      { id: 'medical_licence_exp', title: 'medical_licence_exp' },
      { id: 'is_insurance_policy', title: 'is_insurance_policy' },
      { id: 'comment', title: 'comment' },
      { id: 'status', title: 'status' },
      { id: 'photo_seal', title: 'photo_seal' },
      { id: 'photo_slmc_id', title: 'photo_slmc_id' },
      { id: 'is_pglm_certificate', title: 'is_pglm_certificate' },
    ]
  });

  for (let i = 0; i < array.length; i++) {
    let temp = [];
    temp.push({
      id: array[i].id,
      specialty_id: array[i].specialty_id,
      fee: array[i].fee,
      title: array[i].title,
      medical_school: array[i].medical_school,
      qualification: array[i].qualification,
      bank_acc_name: array[i].bank_acc_name,
      bank_accont_no: array[i].bank_accont_no,
      bank_name: array[i].bank_name,
      branch: array[i].branch,
      package_id: null,
      created_at: new Date(),
      updated_at: null,
      deleted_at: null,
      first_name: array[i].first_name,
      last_name: array[i].last_name,
      email: array[i].email,
      gender: null,
      dob: array[i].dob,
      address: array[i].address,
      phone: array[i].phone,
      norm_phone: commonUtil.validateValue(array[i].phone) ? null : commonUtil.getNormPhone(array[i].phone),
      country_id: array[i].country_id,
      registration_body: array[i].registration_body,
      reg_no: array[i].reg_no,
      nic: array[i].nic,
      norm_nic: commonUtil.validateValue(array[i].nic) ? null : commonUtil.getNormNIC(array[i].nic),
      practice_location: array[i].practice_location,
      pre_booking_text: array[i].pre_booking_text,
      consultation_duration: array[i].consultation_duration,
      is_on_demand: array[i].is_on_demand,
      photo_signature: array[i].photo_signature,
      photo_nic: null,
      photo_medical_licence: null,
      photo_profile: array[i].photo_profile,
      medical_licence_exp: null,
      is_insurance_policy: 0,
      comment: array[i].comment,
      status: array[i].status,
      photo_seal: array[i].photo_seal,
      photo_slmc_id: array[i].photo_slmc_id,
      is_pglm_certificate: array[i].is_pglm_certificate
    });

    await csvWriter.writeRecords([array[i]])
      .then(() => {
        console.log(i + ' Done');
      });
  }
}

let createSQLtoFile = (array: any[]) => {
  var sql =
    "INSERT INTO doctor_informations (id, specialty_id,fee, title,medical_school,qualification,bank_acc_name,bank_accont_no," +
    "bank_name,branch,package_id,created_at,updated_at,deleted_at,first_name,last_name," +
    "email,gender,dob,address,phone,norm_phone,country_id,registration_body,reg_no,nic,norm_nic,practice_location," +
    "pre_booking_text,consultation_duration,is_on_demand," +
    "photo_signature,photo_nic,photo_medical_licence,photo_profile,medical_licence_exp,is_insurance_policy,comment,status,photo_seal,photo_slmc_id,is_pglm_certificate) VALUES " + JSON.stringify(array);

  Fs.writeFile('SQL.txt', sql, function (err) {
    if (err) {
      return console.error(err);
    }
    console.log("SQL File created!");
  });
}




