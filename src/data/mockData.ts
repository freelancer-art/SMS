import { Member, Payment, Expense, Complaint, Notice, Invoice, Visitor, ComplaintReply } from '../types';

export const INITIAL_MEMBERS: Member[] = [
  {
    FlatNo: "101",
    OwnerName: "Amit Sharma",
    ContactNo: "+91 98765 43210",
    Email: "amit.sharma@example.com",
    Balance: 1500,
    Status: "Owner",
    CoOwners: "Sunita Sharma (Spouse)",
    VehicleNo: "MH-02-AB-1234"
  },
  {
    FlatNo: "102",
    OwnerName: "Priya Patel",
    ContactNo: "+91 98765 12345",
    Email: "priya.p@example.com",
    Balance: 0,
    Status: "Owner",
    CoOwners: "None",
    VehicleNo: "MH-02-CD-5678"
  },
  {
    FlatNo: "103",
    OwnerName: "Rajesh Kumar",
    ContactNo: "+91 98234 56789",
    Email: "rajesh.tenant@example.com",
    Balance: 3000,
    Status: "Tenant",
    CoOwners: "Nikhil Kumar (Brother)",
    VehicleNo: "MH-02-XY-9012"
  },
  {
    FlatNo: "201",
    OwnerName: "Vikram Singh",
    ContactNo: "+91 98111 22233",
    Email: "vikram.singh@example.com",
    Balance: -1500, // Advance payment
    Status: "Owner",
    CoOwners: "Renu Singh",
    VehicleNo: "MH-02-VS-2010"
  },
  {
    FlatNo: "202",
    OwnerName: "Anjali Gupta",
    ContactNo: "+91 99887 76655",
    Email: "anjali.g@example.com",
    Balance: 4500,
    Status: "Tenant",
    CoOwners: "None",
    VehicleNo: "MH-02-PQ-4455"
  },
  {
    FlatNo: "203",
    OwnerName: "Rahul Verma",
    ContactNo: "+91 97766 55443",
    Email: "rverma@example.com",
    Balance: 1500,
    Status: "Owner",
    CoOwners: "Megha Verma",
    VehicleNo: "MH-02-RV-2030"
  },
  {
    FlatNo: "301",
    OwnerName: "Neha Joshi",
    ContactNo: "+91 96655 44332",
    Email: "neha.joshi@example.com",
    Balance: 0,
    Status: "Owner",
    CoOwners: "Sanjay Joshi (Father)",
    VehicleNo: "MH-02-NJ-3010"
  },
  {
    FlatNo: "302",
    OwnerName: "Siddharth Shah",
    ContactNo: "+91 95544 33221",
    Email: "sidd.shah@example.com",
    Balance: 6000, // Dues for 4 months
    Status: "Tenant",
    CoOwners: "Krupa Shah",
    VehicleNo: "MH-02-SS-3020"
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  // July 2026
  {
    id: "P-101",
    Date: "2026-07-15",
    FlatNo: "101",
    OwnerName: "Amit Sharma",
    Amount: 1500,
    Mode: "UPI",
    ReferenceNo: "UPI92837498112",
    Status: "Cleared"
  },
  {
    id: "P-102",
    Date: "2026-07-14",
    FlatNo: "201",
    OwnerName: "Vikram Singh",
    Amount: 3000,
    Mode: "Bank Transfer",
    ReferenceNo: "NEFT-TXN12038910",
    Status: "Cleared"
  },
  {
    id: "P-103",
    Date: "2026-07-10",
    FlatNo: "301",
    OwnerName: "Neha Joshi",
    Amount: 1500,
    Mode: "UPI",
    ReferenceNo: "UPI83748291038",
    Status: "Cleared"
  },
  {
    id: "P-104",
    Date: "2026-07-08",
    FlatNo: "102",
    OwnerName: "Priya Patel",
    Amount: 1500,
    Mode: "Cash",
    ReferenceNo: "",
    Status: "Cleared"
  },
  {
    id: "P-105",
    Date: "2026-07-02",
    FlatNo: "202",
    OwnerName: "Anjali Gupta",
    Amount: 1500,
    Mode: "Cheque",
    ReferenceNo: "CHQ-893041",
    Status: "Cleared"
  },
  // June 2026
  {
    id: "P-090",
    Date: "2026-06-15",
    FlatNo: "101",
    OwnerName: "Amit Sharma",
    Amount: 1500,
    Mode: "UPI",
    ReferenceNo: "UPI92003923011",
    Status: "Cleared"
  },
  {
    id: "P-091",
    Date: "2026-06-12",
    FlatNo: "102",
    OwnerName: "Priya Patel",
    Amount: 1500,
    Mode: "UPI",
    ReferenceNo: "UPI92008883201",
    Status: "Cleared"
  },
  {
    id: "P-092",
    Date: "2026-06-10",
    FlatNo: "203",
    OwnerName: "Rahul Verma",
    Amount: 1500,
    Mode: "Bank Transfer",
    ReferenceNo: "NEFT-TXN992831",
    Status: "Cleared"
  },
  {
    id: "P-093",
    Date: "2026-06-05",
    FlatNo: "301",
    OwnerName: "Neha Joshi",
    Amount: 1500,
    Mode: "Cash",
    ReferenceNo: "",
    Status: "Cleared"
  },
  // May 2026
  {
    id: "P-080",
    Date: "2026-05-15",
    FlatNo: "101",
    OwnerName: "Amit Sharma",
    Amount: 1500,
    Mode: "UPI",
    ReferenceNo: "UPI81103921102",
    Status: "Cleared"
  },
  {
    id: "P-081",
    Date: "2026-05-14",
    FlatNo: "201",
    OwnerName: "Vikram Singh",
    Amount: 3000,
    Mode: "Bank Transfer",
    ReferenceNo: "NEFT-TXN881923",
    Status: "Cleared"
  },
  {
    id: "P-082",
    Date: "2026-05-08",
    FlatNo: "301",
    OwnerName: "Neha Joshi",
    Amount: 1500,
    Mode: "UPI",
    ReferenceNo: "UPI83321102941",
    Status: "Cleared"
  },
  {
    id: "P-083",
    Date: "2026-05-02",
    FlatNo: "202",
    OwnerName: "Anjali Gupta",
    Amount: 1500,
    Mode: "Cheque",
    ReferenceNo: "CHQ-772911",
    Status: "Cleared"
  },
  // April 2026
  {
    id: "P-070",
    Date: "2026-04-18",
    FlatNo: "101",
    OwnerName: "Amit Sharma",
    Amount: 1500,
    Mode: "UPI",
    ReferenceNo: "UPI77102910391",
    Status: "Cleared"
  },
  {
    id: "P-071",
    Date: "2026-04-15",
    FlatNo: "102",
    OwnerName: "Priya Patel",
    Amount: 1500,
    Mode: "UPI",
    ReferenceNo: "UPI77109923012",
    Status: "Cleared"
  },
  {
    id: "P-072",
    Date: "2026-04-10",
    FlatNo: "203",
    OwnerName: "Rahul Verma",
    Amount: 1500,
    Mode: "Cash",
    ReferenceNo: "",
    Status: "Cleared"
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  // July 2026
  {
    id: "E-101",
    Date: "2026-07-16",
    Category: "Security",
    Amount: 12000,
    Vendor: "Apex Guard Services",
    InvoiceNo: "INV-2026-102",
    ApprovedBy: "Society Committee"
  },
  {
    id: "E-102",
    Date: "2026-07-14",
    Category: "Electricity",
    Amount: 4520,
    Vendor: "MSEDCL Electric",
    InvoiceNo: "ELEC-JUL-9923",
    ApprovedBy: "Secretary"
  },
  {
    id: "E-103",
    Date: "2026-07-12",
    Category: "Water",
    Amount: 3200,
    Vendor: "AquaFlow Tankers",
    InvoiceNo: "WT-4028",
    ApprovedBy: "Treasurer"
  },
  {
    id: "E-104",
    Date: "2026-07-05",
    Category: "Repairs",
    Amount: 1800,
    Vendor: "QuickFix Plumbing",
    InvoiceNo: "QF-1049",
    ApprovedBy: "Secretary"
  },
  {
    id: "E-105",
    Date: "2026-07-01",
    Category: "Gardening",
    Amount: 2500,
    Vendor: "GreenSprout Nursery",
    InvoiceNo: "GS-403",
    ApprovedBy: "Treasurer"
  },
  // June 2026
  {
    id: "E-090",
    Date: "2026-06-16",
    Category: "Security",
    Amount: 12000,
    Vendor: "Apex Guard Services",
    InvoiceNo: "INV-2026-090",
    ApprovedBy: "Society Committee"
  },
  {
    id: "E-091",
    Date: "2026-06-12",
    Category: "Electricity",
    Amount: 3850,
    Vendor: "MSEDCL Electric",
    InvoiceNo: "ELEC-JUN-8821",
    ApprovedBy: "Secretary"
  },
  {
    id: "E-092",
    Date: "2026-06-08",
    Category: "Water",
    Amount: 2900,
    Vendor: "AquaFlow Tankers",
    InvoiceNo: "WT-3911",
    ApprovedBy: "Treasurer"
  },
  // May 2026
  {
    id: "E-080",
    Date: "2026-05-16",
    Category: "Security",
    Amount: 12000,
    Vendor: "Apex Guard Services",
    InvoiceNo: "INV-2026-080",
    ApprovedBy: "Society Committee"
  },
  {
    id: "E-081",
    Date: "2026-05-14",
    Category: "Electricity",
    Amount: 4100,
    Vendor: "MSEDCL Electric",
    InvoiceNo: "ELEC-MAY-7721",
    ApprovedBy: "Secretary"
  },
  {
    id: "E-082",
    Date: "2026-05-10",
    Category: "Water",
    Amount: 3100,
    Vendor: "AquaFlow Tankers",
    InvoiceNo: "WT-3829",
    ApprovedBy: "Treasurer"
  },
  {
    id: "E-083",
    Date: "2026-05-05",
    Category: "Repairs",
    Amount: 3500,
    Vendor: "Metro Elevators",
    InvoiceNo: "ME-9923",
    ApprovedBy: "Secretary"
  },
  // April 2026
  {
    id: "E-070",
    Date: "2026-04-16",
    Category: "Security",
    Amount: 12000,
    Vendor: "Apex Guard Services",
    InvoiceNo: "INV-2026-070",
    ApprovedBy: "Society Committee"
  },
  {
    id: "E-071",
    Date: "2026-04-12",
    Category: "Electricity",
    Amount: 3500,
    Vendor: "MSEDCL Electric",
    InvoiceNo: "ELEC-APR-6621",
    ApprovedBy: "Secretary"
  },
  {
    id: "E-072",
    Date: "2026-04-05",
    Category: "Water",
    Amount: 2500,
    Vendor: "AquaFlow Tankers",
    InvoiceNo: "WT-3712",
    ApprovedBy: "Treasurer"
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: "C-101",
    FlatNo: "202",
    Category: "Plumbing",
    Title: "Water leakage in bathroom",
    Description: "Water is dripping from the ceiling toilet pipe valve continuously, causing a small pool. It appears to be coming from flat 302 above.",
    Date: "2026-07-18",
    Status: "Open",
    Urgency: "High"
  },
  {
    id: "C-102",
    FlatNo: "103",
    Category: "Electrical",
    Title: "Corridor light not working",
    Description: "The corridor tube-light outside flat 103 has fused and needs replacement. It gets very dark in the evening.",
    Date: "2026-07-17",
    Status: "In Progress",
    Urgency: "Low"
  },
  {
    id: "C-103",
    FlatNo: "302",
    Category: "Parking",
    Title: "Unauthorized vehicle parked in spot B-4",
    Description: "A black SUV (MH-12-KL-8899) has been parked in my designated spot B-4 since yesterday afternoon without permission.",
    Date: "2026-07-15",
    Status: "Resolved",
    Urgency: "Medium"
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: "N-101",
    Date: "2026-07-18",
    Title: "Annual General Body Meeting (AGM) Agenda",
    Category: "Meeting",
    Content: "All members are requested to attend the Annual General Body Meeting on Sunday, July 26th at 10:00 AM in the Clubhouse. Discussion items include:\n\n1. Approval of financial audits for FY 2025-26.\n2. Review and revision of monthly maintenance dues.\n3. Security system upgrade proposal (CCTV & Intercom).\n4. Election of new committee members.",
    AttachmentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    PostedBy: "Management Committee"
  },
  {
    id: "N-102",
    Date: "2026-07-12",
    Title: "Overhead Water Tank Cleaning Schedule",
    Category: "Maintenance",
    Content: "Please note that water supply will be suspended on Monday, July 20th from 10:00 AM to 4:00 PM due to semi-annual professional overhead and underground tank cleaning.\n\nAll residents are kindly requested to store sufficient water in advance to avoid any inconvenience.",
    AttachmentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    PostedBy: "Facility Manager"
  },
  {
    id: "N-103",
    Date: "2026-07-05",
    Title: "Monsoon Preparedness & Balcony Safety",
    Category: "Rules",
    Content: "As the heavy monsoon season begins, kindly observe the following guidelines:\n\n- Ensure balcony drain holes are clear of dry leaves and potted plant soil.\n- Do not place loose decorative items on balcony ledges where they could fall in strong winds.\n- Close windows and balcony glass sliding panels firmly during storms.",
    AttachmentUrl: "",
    PostedBy: "Security Committee"
  }
];

// Multi-Tenant Mock Data Append
export const MULTI_TENANT_MEMBERS: Member[] = [
  // Greenwood members (mapped with societyId: 'greenwood')
  ...INITIAL_MEMBERS.map(m => ({ ...m, SocietyId: 'greenwood', id: m.id || `M-greenwood-${m.FlatNo}` })),
  
  // Amit Sharma owns a second flat in Greenwood: Flat 303
  {
    id: "M-greenwood-303",
    SocietyId: "greenwood",
    FlatNo: "303",
    OwnerName: "Amit Sharma",
    ContactNo: "+91 98765 43210",
    Email: "amit.sharma@example.com",
    Balance: 4500,
    Status: "Owner",
    CoOwners: "Sunita Sharma",
    VehicleNo: "MH-02-AB-1234"
  },
  
  // Royal Heights members
  {
    id: "M-royal-T1-101",
    SocietyId: "royal_heights",
    FlatNo: "101",
    Wing: "Tower 1",
    OwnerName: "Vikram Malhotra",
    ContactNo: "+91 91234 56789",
    Email: "v.malhotra@royalheights.com",
    Balance: 2500,
    Status: "Owner",
    CoOwners: "Meera Malhotra",
    VehicleNo: "MH-43-XY-1010"
  },
  {
    id: "M-royal-T1-102",
    SocietyId: "royal_heights",
    FlatNo: "102",
    Wing: "Tower 1",
    OwnerName: "Sneha Rao",
    ContactNo: "+91 92345 67890",
    Email: "sneha.rao@royalheights.com",
    Balance: 0,
    Status: "Owner",
    CoOwners: "None",
    VehicleNo: "MH-43-AB-2020"
  },
  {
    id: "M-royal-T2-201",
    SocietyId: "royal_heights",
    FlatNo: "201",
    Wing: "Tower 2",
    OwnerName: "Rohan Mehta",
    ContactNo: "+91 93456 78901",
    Email: "rohan.m@example.com",
    Balance: -5000, // advance
    Status: "Owner",
    CoOwners: "Karan Mehta",
    VehicleNo: "MH-43-RM-3030"
  },
  {
    id: "M-royal-T2-202",
    SocietyId: "royal_heights",
    FlatNo: "202",
    Wing: "Tower 2",
    OwnerName: "Priyanka Sen",
    ContactNo: "+91 94567 89012",
    Email: "p.sen@tenant.com",
    Balance: 4000,
    Status: "Tenant",
    CoOwners: "None",
    VehicleNo: "MH-43-PS-4040"
  },

  // Sea Breeze members
  {
    id: "M-seabreeze-A-101",
    SocietyId: "sea_breeze",
    FlatNo: "101",
    Wing: "Wing A",
    OwnerName: "Kabir Merchant",
    ContactNo: "+91 95678 90123",
    Email: "kabir.m@seabreeze.com",
    Balance: 1200,
    Status: "Owner",
    CoOwners: "Alia Merchant",
    VehicleNo: "MH-02-KM-9999"
  },
  {
    id: "M-seabreeze-B-201",
    SocietyId: "sea_breeze",
    FlatNo: "201",
    Wing: "Wing B",
    OwnerName: "Zoya Contractor",
    ContactNo: "+91 96789 01234",
    Email: "zoya@example.com",
    Balance: 0,
    Status: "Owner",
    CoOwners: "None",
    VehicleNo: "MH-02-ZC-8888"
  },
  {
    id: "M-seabreeze-B-301",
    SocietyId: "sea_breeze",
    FlatNo: "301",
    Wing: "Wing B",
    OwnerName: "Amit Sharma",
    ContactNo: "+91 98765 43210",
    Email: "amit.sharma@example.com",
    Balance: 1500,
    Status: "Owner",
    CoOwners: "Sunita Sharma",
    VehicleNo: "MH-02-AB-1234"
  }
];

export const MULTI_TENANT_PAYMENTS: Payment[] = [
  ...INITIAL_PAYMENTS.map((p, idx) => ({ ...p, SocietyId: 'greenwood', id: p.id || `P-greenwood-${idx}` })),
  
  // Royal Heights Payments
  {
    id: "P-royal-101",
    SocietyId: "royal_heights",
    MemberId: "M-royal-T1-101",
    Date: "2026-07-14",
    FlatNo: "101",
    OwnerName: "Vikram Malhotra",
    Amount: 2500,
    Mode: "UPI",
    ReferenceNo: "UPI9920192301",
    Status: "Cleared"
  },
  {
    id: "P-royal-102",
    SocietyId: "royal_heights",
    MemberId: "M-royal-T2-201",
    Date: "2026-07-10",
    FlatNo: "201",
    OwnerName: "Rohan Mehta",
    Amount: 5000,
    Mode: "Bank Transfer",
    ReferenceNo: "NEFT-TXN992011",
    Status: "Cleared"
  },

  // Sea Breeze Payments
  {
    id: "P-seabreeze-101",
    SocietyId: "sea_breeze",
    MemberId: "M-seabreeze-A-101",
    Date: "2026-07-12",
    FlatNo: "101",
    OwnerName: "Kabir Merchant",
    Amount: 1200,
    Mode: "UPI",
    ReferenceNo: "UPI90291039",
    Status: "Cleared"
  }
];

export const MULTI_TENANT_EXPENSES: Expense[] = [
  ...INITIAL_EXPENSES.map((e, idx) => ({ ...e, SocietyId: 'greenwood', id: e.id || `E-greenwood-${idx}` })),

  // Royal Heights Expenses
  {
    id: "E-royal-101",
    SocietyId: "royal_heights",
    Date: "2026-07-15",
    Category: "Security",
    Amount: 15000,
    Vendor: "Royal Security Shield",
    InvoiceNo: "RSS-902",
    ApprovedBy: "Board of Directors"
  },
  {
    id: "E-royal-102",
    SocietyId: "royal_heights",
    Date: "2026-07-11",
    Category: "Repairs",
    Amount: 6200,
    Vendor: "Elevate Lifts Corp",
    InvoiceNo: "ELC-4091",
    ApprovedBy: "Manager"
  },

  // Sea Breeze Expenses
  {
    id: "E-seabreeze-101",
    SocietyId: "sea_breeze",
    Date: "2026-07-10",
    Category: "Water",
    Amount: 4100,
    Vendor: "Coastal Water Tankers",
    InvoiceNo: "CW-1022",
    ApprovedBy: "Treasurer"
  }
];

export const MULTI_TENANT_COMPLAINTS: Complaint[] = [
  ...INITIAL_COMPLAINTS.map((c, idx) => ({ ...c, SocietyId: 'greenwood', id: c.id || `C-greenwood-${idx}` })),

  // Royal Heights Complaints
  {
    id: "C-royal-101",
    SocietyId: "royal_heights",
    FlatNo: "202",
    Category: "Electrical",
    Title: "Power fluctuation in T2 Tower",
    Description: "Voltage fluctuations in Tower 2 are occurring every evening after 7 PM. It is trippling heavy appliances.",
    Date: "2026-07-16",
    Status: "Open",
    Urgency: "High"
  },

  // Sea Breeze Complaints
  {
    id: "C-seabreeze-101",
    SocietyId: "sea_breeze",
    FlatNo: "201",
    Category: "Cleanliness",
    Title: "Garbage pile in lobby area",
    Description: "Housekeeping has missed clearing the lobby dustbins for the last two days.",
    Date: "2026-07-15",
    Status: "In Progress",
    Urgency: "Medium"
  }
];

export const MULTI_TENANT_NOTICES: Notice[] = [
  ...INITIAL_NOTICES.map((n, idx) => ({ ...n, SocietyId: 'greenwood', id: n.id || `N-greenwood-${idx}` })),

  // Royal Heights Notices
  {
    id: "N-royal-101",
    SocietyId: "royal_heights",
    Date: "2026-07-15",
    Title: "CCTV Installation in Basements",
    Category: "Security",
    Content: "CCTV security camera installation is scheduled for July 22nd to July 24th in both B1 and B2 basement parking lots. Please cooperate with the security technicians.",
    AttachmentUrl: "",
    PostedBy: "Secretary"
  },

  // Sea Breeze Notices
  {
    id: "N-seabreeze-101",
    SocietyId: "sea_breeze",
    Date: "2026-07-14",
    Title: "Independence Day Flag Hoisting",
    Category: "Celebration",
    Content: "You are cordially invited with your families for the flag hoisting ceremony on August 15th at 9:00 AM on the society lawn. This will be followed by light snacks.",
    AttachmentUrl: "",
    PostedBy: "Entertainment Committee"
  }
];

export const MULTI_TENANT_INVOICES: Invoice[] = [
  // Greenwood Residency Invoices
  {
    id: "INV-greenwood-0",
    SocietyId: "greenwood",
    BillMonth: "July 2026",
    FlatNo: "101",
    OwnerName: "Amit Sharma",
    BaseAmount: 2000,
    WaterCharges: 300,
    SecurityCharges: 200,
    ParkingCharges: 100,
    TotalAmount: 2600,
    DueDate: "2026-07-31",
    Status: "Unpaid",
    IssuedDate: "2026-07-01"
  },
  {
    id: "INV-greenwood-1",
    SocietyId: "greenwood",
    BillMonth: "June 2026",
    FlatNo: "101",
    OwnerName: "Amit Sharma",
    BaseAmount: 2000,
    WaterCharges: 300,
    SecurityCharges: 200,
    ParkingCharges: 100,
    TotalAmount: 2600,
    DueDate: "2026-06-30",
    Status: "Paid",
    IssuedDate: "2026-06-01"
  },
  {
    id: "INV-greenwood-2",
    SocietyId: "greenwood",
    BillMonth: "July 2026",
    FlatNo: "102",
    OwnerName: "Priya Patel",
    BaseAmount: 2000,
    WaterCharges: 300,
    SecurityCharges: 200,
    ParkingCharges: 0,
    TotalAmount: 2500,
    DueDate: "2026-07-31",
    Status: "Paid",
    IssuedDate: "2026-07-01"
  },
  // Sea Breeze Invoices
  {
    id: "INV-seabreeze-0",
    SocietyId: "sea_breeze",
    BillMonth: "July 2026",
    FlatNo: "301",
    OwnerName: "Amit Sharma",
    BaseAmount: 3000,
    WaterCharges: 400,
    SecurityCharges: 300,
    ParkingCharges: 150,
    TotalAmount: 3850,
    DueDate: "2026-07-31",
    Status: "Unpaid",
    IssuedDate: "2026-07-01"
  }
];

export const MULTI_TENANT_VISITORS: Visitor[] = [
  // Greenwood Residency Visitors
  {
    id: "VIS-greenwood-0",
    SocietyId: "greenwood",
    FlatNo: "101",
    VisitorName: "Rajesh (Zomato)",
    Purpose: "Delivery",
    ContactNo: "+91 98888 12345",
    VehicleNo: "MH-02-ZZ-9988",
    CheckInTime: "2026-07-21T01:10:00",
    Status: "Pending Approval"
  },
  {
    id: "VIS-greenwood-1",
    SocietyId: "greenwood",
    FlatNo: "102",
    VisitorName: "Sanjay Kumar (Plumber)",
    Purpose: "Maintenance",
    ContactNo: "+91 97777 54321",
    CheckInTime: "2026-07-20T11:15:00",
    CheckOutTime: "2026-07-20T12:30:00",
    Status: "Checked Out",
    HostApprovedBy: "Priya Patel"
  },
  {
    id: "VIS-greenwood-2",
    SocietyId: "greenwood",
    FlatNo: "101",
    VisitorName: "Anil Sharma (Brother)",
    Purpose: "Guest",
    ContactNo: "+91 96666 98765",
    VehicleNo: "DL-01-AB-5678",
    CheckInTime: "2026-07-21T00:15:00",
    Status: "Pre-Approved"
  }
];

export const MULTI_TENANT_COMPLAINT_REPLIES: ComplaintReply[] = [
  {
    id: "REP-greenwood-0",
    ComplaintId: "C-greenwood-0",
    SocietyId: "greenwood",
    SenderName: "Amit Sharma (Secretary)",
    SenderRole: "Admin",
    Message: "Plumber has been requested. He will visit your flat to inspect tomorrow morning.",
    Timestamp: "2026-07-19T10:30:00"
  },
  {
    id: "REP-greenwood-1",
    ComplaintId: "C-greenwood-0",
    SocietyId: "greenwood",
    SenderName: "Karan Johar (Resident)",
    SenderRole: "Member",
    Message: "Thanks, please make sure he inspects the leakage source in 302 as well.",
    Timestamp: "2026-07-19T11:15:00"
  }
];

// Secure roles and credentials for multi-tenant simulation
export interface RoleMock {
  id: string;
  RoleName: 'SuperAdmin' | 'Admin' | 'Committee Member' | 'Member';
  SocietyId?: string;
  Description?: string;
}

export interface UserAuthMock {
  id: string;
  EmailOrPhone: string;
  PasswordHash: string;
  Salt: string;
  RoleId: string;
  SocietyId?: string;
  Status: 'Active' | 'Suspended';
}

export const MULTI_TENANT_ROLES: RoleMock[] = [
  // SuperAdmin Role (Global)
  {
    id: "Role-SuperAdmin",
    RoleName: "SuperAdmin",
    Description: "Global Super-Admin overseeing all societies and launching new ones"
  },
  // Greenwood Roles
  {
    id: "Role-greenwood-admin",
    RoleName: "Admin",
    SocietyId: "greenwood",
    Description: "Primary Admin Secretary for Greenwood Residency"
  },
  {
    id: "Role-greenwood-committee",
    RoleName: "Committee Member",
    SocietyId: "greenwood",
    Description: "Elected Committee Member for Greenwood Residency"
  },
  {
    id: "Role-greenwood-member",
    RoleName: "Member",
    SocietyId: "greenwood",
    Description: "Standard Flat Owner or Tenant"
  },
  // Royal Heights Roles
  {
    id: "Role-royal-admin",
    RoleName: "Admin",
    SocietyId: "royal_heights",
    Description: "Primary Admin Secretary for Royal Heights"
  },
  {
    id: "Role-royal-committee",
    RoleName: "Committee Member",
    SocietyId: "royal_heights",
    Description: "Elected Committee Member for Royal Heights"
  },
  {
    id: "Role-royal-member",
    RoleName: "Member",
    SocietyId: "royal_heights",
    Description: "Standard Resident in Royal Heights"
  }
];

// Default UserAuth entries.
// We will populate PasswordHash at runtime dynamically in App.tsx if needed, or define standard secure hashes
export const MULTI_TENANT_USER_AUTHS: UserAuthMock[] = [
  // Super-Admin
  {
    id: "Auth-Super-Admin",
    EmailOrPhone: "superadmin@societyconnect.com",
    PasswordHash: "C6F2A5623B689793", // will mix with salt
    Salt: "SALT-SUPER-ADMIN",
    RoleId: "Role-SuperAdmin",
    Status: "Active"
  },
  // Greenwood Primary Admin: Amit Sharma
  {
    id: "Auth-gw-amit-sharma",
    EmailOrPhone: "amit080578@gmail.com",
    PasswordHash: "", // will compute dynamically
    Salt: "SALT-GW-AMIT",
    RoleId: "Role-greenwood-admin",
    SocietyId: "greenwood",
    Status: "Active"
  },
  {
    id: "Auth-gw-amit-sharma-alt",
    EmailOrPhone: "amit.sharma@example.com",
    PasswordHash: "", // will compute dynamically
    Salt: "SALT-GW-AMIT-ALT",
    RoleId: "Role-greenwood-admin",
    SocietyId: "greenwood",
    Status: "Active"
  },
  // Royal Heights Primary Admin: Royal Secretary
  {
    id: "Auth-royal-sec",
    EmailOrPhone: "admin@royalheights.com",
    PasswordHash: "", // will compute dynamically
    Salt: "SALT-ROYAL-SEC",
    RoleId: "Role-royal-admin",
    SocietyId: "royal_heights",
    Status: "Active"
  }
];


