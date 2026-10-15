/**
 * Danh sách Ngân hàng thương mại tại Việt Nam (Chuẩn NAPAS / VietQR)
 * Bạn có thể tự do bổ sung thêm ngân hàng mới vào danh sách này bất cứ lúc nào.
 */
export interface BankOption {
  value: string;
  label: string;
  shortName?: string;
  code?: string;
}

export const VIETNAM_BANKS: BankOption[] = [
  // 1. Nhóm Big 4 (Ngân hàng Quốc doanh & Thương mại cổ phần Nhà nước)
  { value: 'Vietcombank', label: 'Vietcombank - Ngân hàng Ngoại thương Việt Nam', shortName: 'VCB', code: '970436' },
  { value: 'BIDV', label: 'BIDV - Ngân hàng Đầu tư và Phát triển Việt Nam', shortName: 'BIDV', code: '970418' },
  { value: 'VietinBank', label: 'VietinBank - Ngân hàng Công Thương Việt Nam', shortName: 'CTG', code: '970415' },
  { value: 'Agribank', label: 'Agribank - Ngân hàng Nông nghiệp và PTNT Việt Nam', shortName: 'VBA', code: '970405' },

  // 2. Nhóm Ngân hàng TMCP lớn & phổ biến
  { value: 'Techcombank', label: 'Techcombank - Ngân hàng Kỹ Thương Việt Nam', shortName: 'TCB', code: '970407' },
  { value: 'MB Bank', label: 'MB Bank - Ngân hàng Quân Đội', shortName: 'MB', code: '970422' },
  { value: 'ACB', label: 'ACB - Ngân hàng Á Châu', shortName: 'ACB', code: '970416' },
  { value: 'VPBank', label: 'VPBank - Ngân hàng Việt Nam Thịnh Vượng', shortName: 'VPB', code: '970432' },
  { value: 'TPBank', label: 'TPBank - Ngân hàng Tiên Phong', shortName: 'TPB', code: '970423' },
  { value: 'Sacombank', label: 'Sacombank - Ngân hàng Sài Gòn Thương Tín', shortName: 'STB', code: '970403' },
  { value: 'HDBank', label: 'HDBank - Ngân hàng Phát triển TP.HCM', shortName: 'HDB', code: '970437' },
  { value: 'VIB', label: 'VIB - Ngân hàng Quốc tế', shortName: 'VIB', code: '970441' },
  { value: 'SHB', label: 'SHB - Ngân hàng Sài Gòn - Hà Nội', shortName: 'SHB', code: '970443' },
  { value: 'MSB', label: 'MSB - Ngân hàng Hàng Hải Việt Nam', shortName: 'MSB', code: '970426' },
  { value: 'OCB', label: 'OCB - Ngân hàng Phương Đông', shortName: 'OCB', code: '970448' },
  { value: 'SeABank', label: 'SeABank - Ngân hàng Đông Nam Á', shortName: 'SSB', code: '970440' },
  { value: 'LPBank', label: 'LPBank - Ngân hàng Lộc Phát Việt Nam', shortName: 'LPB', code: '970449' },
  { value: 'Nam A Bank', label: 'Nam A Bank - Ngân hàng Nam Á', shortName: 'NAB', code: '970428' },
  { value: 'Bac A Bank', label: 'Bac A Bank - Ngân hàng Bắc Á', shortName: 'BAB', code: '970409' },
  { value: 'PVcomBank', label: 'PVcomBank - Ngân hàng Đại Chúng Việt Nam', shortName: 'PVB', code: '970412' },
  { value: 'KienlongBank', label: 'KienlongBank - Ngân hàng Kiên Long', shortName: 'KLB', code: '970452' },
  { value: 'BaoViet Bank', label: 'BaoViet Bank - Ngân hàng Bảo Việt', shortName: 'BVB', code: '970438' },
  { value: 'VietABank', label: 'VietABank - Ngân hàng Việt Á', shortName: 'VAB', code: '970427' },
  { value: 'Saigonbank', label: 'Saigonbank - Ngân hàng Sài Gòn Công Thương', shortName: 'SGB', code: '970400' },
  { value: 'NCB', label: 'NCB - Ngân hàng Quốc Dân', shortName: 'NCB', code: '970419' },
  { value: 'OceanBank', label: 'OceanBank - Ngân hàng Đại Dương', shortName: 'OJB', code: '970414' },
  { value: 'GPBank', label: 'GPBank - Ngân hàng Dầu Khí Toàn Cầu', shortName: 'GPB', code: '970408' },
  { value: 'CB', label: 'CB - Ngân hàng Xây Dựng', shortName: 'CBB', code: '970444' },

  // 3. Ngân hàng Chính sách & Hợp tác xã
  { value: 'VBSP', label: 'VBSP - Ngân hàng Chính sách Xã hội', shortName: 'VBSP', code: '999888' },
  { value: 'Co-opBank', label: 'Co-opBank - Ngân hàng Hợp tác xã Việt Nam', shortName: 'COOP', code: '970446' },

  // 4. Ngân hàng Nước ngoài & Liên doanh tiêu biểu
  { value: 'Shinhan Bank', label: 'Shinhan Bank - Ngân hàng TNHH MTV Shinhan Việt Nam', shortName: 'SHBVN', code: '970424' },
  { value: 'Standard Chartered', label: 'Standard Chartered - Ngân hàng Standard Chartered Việt Nam', shortName: 'SCBVL', code: '970410' },
  { value: 'HSBC', label: 'HSBC - Ngân hàng TNHH Một thành viên HSBC Việt Nam', shortName: 'HSBC', code: '458761' },
  { value: 'Public Bank', label: 'Public Bank - Ngân hàng TNHH MTV Public Bank Việt Nam', shortName: 'PBVN', code: '970439' },
  { value: 'Hong Leong Bank', label: 'Hong Leong Bank - Ngân hàng Hong Leong Việt Nam', shortName: 'HLBVN', code: '970442' },
  { value: 'Woori Bank', label: 'Woori Bank - Ngân hàng Woori Việt Nam', shortName: 'WOO', code: '970457' },
  { value: 'CIMB', label: 'CIMB - Ngân hàng TNHH MTV CIMB Việt Nam', shortName: 'CIMB', code: '422589' },
  { value: 'UOB', label: 'UOB - Ngân hàng United Overseas Bank Việt Nam', shortName: 'UOB', code: '970458' },
];
