SEED_DATA = [
    # PARTY entities
    (
        "The Landlord Mr. Ramesh Sharma shall lease the premises to Tenant Ms. Priya Iyer.",
        [(16, 30, "PARTY"), (58, 72, "PARTY")]
    ),
    (
        "This agreement is between ABC Technologies Pvt Ltd and XYZ Solutions Ltd.",
        [(24, 48, "PARTY"), (53, 71, "PARTY")]
    ),
    (
        "Priya Enterprises shall deliver goods within 45 days of purchase order.",
        [(0, 17, "PARTY")]
    ),
    (
        "The agreement is executed by Mr. Suresh Patel on behalf of Infosys Limited.",
        [(32, 45, "PARTY"), (58, 73, "PARTY")]
    ),
    (
        "Reliance Industries Ltd agrees to supply goods to Tata Motors Ltd.",
        [(0, 22, "PARTY"), (50, 65, "PARTY")]
    ),
    (
        "The Tenant Ms. Anjali Singh agrees to all terms mentioned herein.",
        [(15, 27, "PARTY")]
    ),
    (
        "Mr. Vikram Nair and Ms. Sunita Rao are parties to this agreement.",
        [(4, 15, "PARTY"), (24, 34, "PARTY")]
    ),
    (
        "The Licensor Wipro Ltd grants the Licensee HCL Technologies the right to use.",
        [(13, 22, "PARTY"), (43, 59, "PARTY")]
    ),
    (
        "This contract is signed by Dr. Arvind Mehta as the authorized representative.",
        [(30, 43, "PARTY")]
    ),
    (
        "The Borrower Mr. Rajesh Gupta agrees to repay the loan to HDFC Bank.",
        [(17, 29, "PARTY"), (58, 67, "PARTY")]
    ),

    # DATE entities
    (
        "This agreement shall commence on 1st April 2026 and expire on 31st March 2027.",
        [(33, 47, "DATE"), (62, 76, "DATE")]
    ),
    (
        "The lease period is 11 months commencing from 15th June 2026.",
        [(20, 29, "DATE"), (46, 60, "DATE")]
    ),
    (
        "Either party may terminate this agreement with 60 days written notice.",
        [(47, 54, "DATE")]
    ),
    (
        "The Tenant must vacate the premises within 30 days of termination notice.",
        [(42, 49, "DATE")]
    ),
    (
        "Payment shall be made within 7 days of invoice receipt.",
        [(29, 35, "DATE")]
    ),
    (
        "The contract was signed on 10th January 2025 and is valid for 2 years.",
        [(27, 44, "DATE"), (62, 69, "DATE")]
    ),
    (
        "The notice period shall be a minimum of 90 days before termination.",
        [(39, 46, "DATE")]
    ),
    (
        "Delivery shall be completed by 31st December 2026.",
        [(31, 49, "DATE")]
    ),
    (
        "The warranty period is 12 months from the date of purchase.",
        [(22, 31, "DATE")]
    ),
    (
        "The agreement renews automatically every 1 year unless terminated.",
        [(41, 47, "DATE")]
    ),

    # MONEY entities
    (
        "The monthly rent shall be Rs. 25000 payable by the 5th of each month.",
        [(26, 35, "MONEY")]
    ),
    (
        "The Tenant shall pay a security deposit of Rs. 75000 prior to occupancy.",
        [(43, 52, "MONEY")]
    ),
    (
        "A penalty of Rs. 5000 per day shall be levied for delayed payments.",
        [(13, 22, "MONEY")]
    ),
    (
        "The total contract value is Rs. 3,00,000 for the entire lease period.",
        [(27, 39, "MONEY")]
    ),
    (
        "XYZ Corporation shall pay ABC Ltd a sum of Rs. 5,00,000.",
        [(43, 55, "MONEY")]
    ),
    (
        "The maintenance charges of Rs. 2000 per month shall be borne by the tenant.",
        [(27, 35, "MONEY")]
    ),
    (
        "Mr. Anil Kumar agrees to pay Rs. 30000 per month as rent.",
        [(29, 35, "MONEY")]
    ),
    (
        "The late payment fee is Rs. 500 for every day of delay.",
        [(24, 31, "MONEY")]
    ),
    (
        "A registration fee of Rs. 10000 is payable at the time of signing.",
        [(22, 31, "MONEY")]
    ),
    (
        "The total project cost is Rs. 15,00,000 inclusive of all taxes.",
        [(26, 38, "MONEY")]
    ),

    # CLAUSE entities
    (
        "Any breach of Clause 4.2 shall result in forfeiture of the security deposit.",
        [(14, 23, "CLAUSE")]
    ),
    (
        "As per Section 7, the landlord shall maintain the property in good condition.",
        [(8, 17, "CLAUSE")]
    ),
    (
        "As per Clause 3.1, the tenant shall maintain the property.",
        [(8, 17, "CLAUSE")]
    ),
    (
        "The obligations under Section 12 shall survive termination of this agreement.",
        [(25, 34, "CLAUSE")]
    ),
    (
        "Refer to Schedule A for the complete list of deliverables.",
        [(9, 19, "CLAUSE")]
    ),
    (
        "The dispute resolution process is outlined in Clause 9.3.",
        [(46, 55, "CLAUSE")]
    ),
    (
        "As mentioned in Annexure B, the payment schedule is attached.",
        [(16, 25, "CLAUSE")]
    ),
    (
        "The confidentiality obligations under Section 5 shall remain in force.",
        [(38, 47, "CLAUSE")]
    ),
    (
        "Penalties for breach are detailed in Clause 6.1 of this agreement.",
        [(37, 46, "CLAUSE")]
    ),
    (
        "The indemnification terms are set out in Schedule C.",
        [(40, 50, "CLAUSE")]
    ),

    # MIXED entities
    (
        "Mr. Anil Kumar shall pay Rs. 30000 to Sunita Properties by 1st March 2026.",
        [(4, 14, "PARTY"), (25, 31, "MONEY"), (38, 55, "PARTY"), (59, 73, "DATE")]
    ),
    (
        "ABC Ltd and XYZ Ltd entered into this agreement on 5th February 2025.",
        [(0, 7, "PARTY"), (12, 19, "PARTY"), (51, 69, "DATE")]
    ),
    (
        "The Tenant shall deposit Rs. 50000 as security before 1st April 2026.",
        [(25, 32, "MONEY"), (54, 68, "DATE")]
    ),
    (
        "As per Clause 2.1, Mr. Sharma shall pay Rs. 12000 monthly.",
        [(8, 17, "CLAUSE"), (23, 32, "PARTY"), (41, 47, "MONEY")]
    ),
    (
        "Tata Consultancy Services shall complete the project by 31st March 2027 for Rs. 8,00,000.",
        [(0, 26, "PARTY"), (56, 70, "DATE"), (75, 87, "MONEY")]
    ),
    (
        "The Lessor Mr. Patel agrees to refund Rs. 25000 within 15 days of vacating.",
        [(14, 22, "PARTY"), (37, 43, "MONEY"), (51, 58, "DATE")]
    ),
    (
        "Ms. Kavitha Reddy signed the lease on 10th May 2026 for Rs. 18000 per month.",
        [(4, 17, "PARTY"), (38, 51, "DATE"), (56, 62, "MONEY")]
    ),
    (
        "Infosys Ltd shall pay Rs. 2,50,000 to Wipro Ltd as per Clause 3.",
        [(0, 10, "PARTY"), (22, 31, "MONEY"), (38, 47, "PARTY"), (55, 63, "CLAUSE")]
    ),
    (
        "The agreement between HDFC Bank and Mr. Rohit Verma expires on 31st December 2027.",
        [(22, 31, "PARTY"), (36, 48, "PARTY"), (63, 81, "DATE")]
    ),
    (
        "Under Section 4, the penalty of Rs. 1000 per day applies from 1st June 2026.",
        [(6, 15, "CLAUSE"), (32, 38, "MONEY"), (62, 75, "DATE")]
    ),
]