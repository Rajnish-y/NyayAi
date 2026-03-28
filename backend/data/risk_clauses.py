RISK_DATA = [
    ("The rent shall be paid on or before the 5th of every month.", 0),
    ("Either party may terminate this agreement with 30 days written notice.", 0),
    ("The tenant shall keep the premises in good and clean condition.", 0),
    ("The security deposit shall be refunded within 30 days of vacating.", 0),
    ("The landlord shall maintain the structural integrity of the premises.", 0),
    ("Monthly rent shall be increased by 5 percent annually.", 0),
    ("The tenant shall pay electricity and water bills separately.", 0),
    ("The landlord shall provide a receipt for all payments made.", 0),
    ("The tenant shall not sublet the premises without prior written consent.", 0),
    ("The tenant shall allow inspection with 24 hours prior notice.", 0),

    # CAUTION
    ("The landlord reserves the right to increase rent at any time with 7 days notice.", 1),
    ("The security deposit of 6 months shall be forfeited if notice period is not served.", 1),
    ("The tenant shall be responsible for all repairs regardless of cause.", 1),
    ("The landlord may assign this agreement to any third party without consent.", 1),
    ("The tenant shall be liable for damages caused by natural wear and tear.", 1),
    ("The landlord may enter the premises at any time for inspection purposes.", 1),
    ("All payments once made shall be non-refundable under any circumstances.", 1),
    ("The tenant shall vacate within 48 hours of receiving termination notice.", 1),

    # DANGEROUS
    ("The landlord may terminate this agreement at any time without prior notice.", 2),
    ("The tenant waives all legal rights and remedies available under applicable law.", 2),
    ("The tenant agrees to vacate immediately upon verbal request by the landlord.", 2),
    ("The landlord may change the locks without notice at their sole discretion.", 2),
    ("The tenant waives the right to approach any court or tribunal.", 2),
    ("The landlord may seize the tenant's belongings in case of any default.", 2),
    ("The tenant agrees that this agreement supersedes all consumer protection laws.", 2),
    ("The tenant waives all rights under the Rent Control Act.", 2),
    ("The landlord may unilaterally modify any term of this agreement at any time.", 2),
    ("The tenant shall pay rent even if the premises become uninhabitable.", 2),


    # SAFE
    ("The employee shall be entitled to 18 days of paid annual leave.", 0),
    ("The notice period for resignation shall be 30 days for both parties.", 0),
    ("The employee shall receive a performance review every 6 months.", 0),
    ("Salary shall be credited to the employee's bank account by the last working day.", 0),
    ("The employee shall be reimbursed for all pre-approved business expenses.", 0),
    ("The company shall provide health insurance coverage to the employee.", 0),
    ("Either party may terminate this contract with 60 days written notice.", 0),
    ("The employee shall be entitled to gratuity as per the Payment of Gratuity Act.", 0),
    ("Overtime work shall be compensated at 1.5 times the regular hourly rate.", 0),
    ("The employee shall be entitled to maternity leave as per applicable law.", 0),

    # CAUTION
    ("The company may change the employee's role or location at its discretion.", 1),
    ("The non-compete clause shall apply for 2 years after termination.", 1),
    ("The employee shall not disclose any company information even after resignation.", 1),
    ("Bonuses are discretionary and shall not form part of the employment contract.", 1),
    ("The company may deduct salary for any losses caused by the employee.", 1),
    ("The employee agrees to work beyond regular hours without additional compensation.", 1),
    ("The company reserves the right to modify job responsibilities at any time.", 1),
    ("The employee shall sign a separate IP assignment agreement for all inventions.", 1),

    # DANGEROUS
    ("The employee waives all rights under the Industrial Disputes Act.", 2),
    ("The company may terminate employment without cause and without notice.", 2),
    ("The employee agrees not to seek employment in any industry for 5 years.", 2),
    ("The company shall not be liable for any workplace injury or illness.", 2),
    ("The employee waives the right to provident fund and gratuity benefits.", 2),
    ("The company may reduce salary at any time without employee consent.", 2),
    ("The employee waives all rights to overtime pay regardless of hours worked.", 2),
    ("The company may terminate employment based solely on client feedback.", 2),
    ("The employee agrees that all disputes shall be resolved solely by management.", 2),
    ("The employee waives the right to approach the labour commissioner.", 2),

    # SAFE
    ("The borrower shall repay the loan in 24 equal monthly instalments.", 0),
    ("The interest rate shall be 12 percent per annum on the outstanding balance.", 0),
    ("The borrower may prepay the loan after 6 months without penalty.", 0),
    ("The lender shall provide a loan statement every quarter.", 0),
    ("The borrower shall be notified 30 days before any change in interest rate.", 0),
    ("The loan shall be disbursed within 7 working days of agreement signing.", 0),
    ("A grace period of 10 days shall be provided for each EMI payment.", 0),
    ("The borrower may request a loan restructuring in case of financial hardship.", 0),

    # CAUTION
    ("The lender may demand full repayment at any time with 15 days notice.", 1),
    ("The borrower shall provide additional collateral if property value decreases.", 1),
    ("The interest rate may be revised quarterly at the lender's discretion.", 1),
    ("The borrower shall pay a prepayment penalty of 5 percent of outstanding amount.", 1),
    ("The lender may share borrower's financial information with third parties.", 1),
    ("All legal costs in case of default shall be borne by the borrower.", 1),
    ("The lender may appoint a recovery agent without prior notice to the borrower.", 1),
    ("The borrower waives the right to dispute the outstanding loan amount.", 1),

    # DANGEROUS
    ("The lender may seize all assets of the borrower upon a single missed payment.", 2),
    ("The borrower waives all rights under the SARFAESI Act.", 2),
    ("The lender may sell the collateral without court order or prior notice.", 2),
    ("The borrower agrees to pay compound interest compounded daily.", 2),
    ("The lender may change the interest rate without any notice to the borrower.", 2),
    ("The borrower waives the right to approach the banking ombudsman.", 2),
    ("The lender may garnish the borrower's salary without a court order.", 2),
    ("The borrower shall be personally liable even if the loan is taken by a company.", 2),
    ("The lender may declare default based solely on its own assessment.", 2),
    ("The borrower waives all rights under the Consumer Protection Act.", 2),

    # SAFE
    ("The vendor shall deliver the goods within 30 days of purchase order.", 0),
    ("Payment shall be made within 45 days of invoice submission.", 0),
    ("Either party may terminate this contract with 30 days written notice.", 0),
    ("The vendor shall provide a warranty of 12 months on all supplied goods.", 0),
    ("Disputes shall be resolved through arbitration under the Arbitration Act.", 0),
    ("The client shall provide written approval before any scope changes.", 0),
    ("The vendor shall maintain confidentiality of all client data.", 0),
    ("Service levels shall be measured monthly and reported to the client.", 0),

    # CAUTION
    ("The client may change project scope at any time without additional cost.", 1),
    ("The vendor shall be liable for all consequential damages arising from delays.", 1),
    ("Payment may be withheld if the client is dissatisfied with deliverables.", 1),
    ("The client may audit the vendor's operations at any time without notice.", 1),
    ("The vendor shall not engage any subcontractors without client approval.", 1),
    ("The client may terminate the contract immediately without cause.", 1),
    ("The vendor shall bear all costs of rework regardless of the reason.", 1),
    ("Intellectual property created during the contract shall vest with the client.", 1),

    # DANGEROUS
    ("The vendor waives all rights to payment if the client is dissatisfied.", 2),
    ("The client may use the vendor's proprietary technology without restriction.", 2),
    ("The vendor shall indemnify the client for all losses including client negligence.", 2),
    ("The client may terminate and claim damages without providing any reason.", 2),
    ("The vendor waives all rights under the MSME Act for delayed payments.", 2),
    ("The client may modify deliverables post-acceptance without vendor consent.", 2),
    ("The vendor shall have no recourse if the client fails to make payments.", 2),
    ("The client may assign vendor obligations to any third party without consent.", 2),

    # SAFE
    ("The accused shall appear before the court on the next date of hearing.", 0),
    ("Bail is granted subject to the accused furnishing a surety of Rs. 10000.", 0),
    ("The investigating officer shall file the charge sheet within 90 days.", 0),
    ("The accused has the right to be represented by a legal counsel of their choice.", 0),
    ("The complainant shall be informed of all hearing dates in advance.", 0),
    ("The court shall provide a copy of the FIR to the accused free of cost.", 0),
    ("The accused is presumed innocent until proven guilty beyond reasonable doubt.", 0),
    ("The court may grant anticipatory bail if the accused apprehends arrest.", 0),

    # CAUTION
    ("The accused shall surrender their passport and shall not leave the country.", 1),
    ("The accused shall report to the police station every Monday until further orders.", 1),
    ("Bail may be cancelled if the accused tampers with evidence or witnesses.", 1),
    ("The accused shall not communicate with the complainant during investigation.", 1),
    ("The property of the accused may be attached pending investigation.", 1),
    ("The accused may be taken into custody if they fail to cooperate.", 1),

    # DANGEROUS
    ("The accused waives the right to legal representation during questioning.", 2),
    ("The confession made to the police shall be treated as conclusive evidence.", 2),
    ("The accused agrees to waive the right to appeal against this order.", 2),
    ("The accused shall be detained without bail for an indefinite period.", 2),
    ("The accused waives the right to be informed of the charges against them.", 2),
    ("The court order shall not be subject to review or challenge in any court.", 2),
]