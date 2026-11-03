import { Language } from '../types';

export interface TranslationStrings {
  brandTitle: string;
  brandTagline: string;
  collegeHeader: string;
  seatedAtTable: string;
  selectYourTable: string;
  table: string;
  tableShort: string;
  searchPlaceholder: string;
  categoryAll: string;
  categoryChai: string;
  categorySnacks: string;
  categoryMain: string;
  categoryDessert: string;
  addToOrder: string;
  addedToast: string;
  outOfStock: string;
  vegOnly: string;
  nonVegOnly: string;
  callWaiter: string;
  callingWaiter: string;
  waiterCalledSuccess: string;
  selectAssistance: string;
  needWater: string;
  needBill: string;
  needCutlery: string;
  generalHelp: string;
  cancel: string;
  confirmCall: string;
  yourCart: string;
  emptyCart: string;
  exploreMenu: string;
  specialInstructions: string;
  specialInstructionsPlaceholder: string;
  itemNotesPlaceholder: string;
  totalPayable: string;
  placeOrder: string;
  placingOrder: string;
  orderReceivedTitle: string;
  orderReceivedSubtitle: string;
  orderNumber: string;
  orderStatus: string;
  statusPending: string;
  statusPreparing: string;
  statusReady: string;
  statusServed: string;
  statusCompleted: string;
  statusCancelled: string;
  statusPendingDesc: string;
  statusPreparingDesc: string;
  statusReadyDesc: string;
  statusServedDesc: string;
  statusCompletedDesc: string;
  orderMore: string;
  rateExperience: string;
  feedbackPlaceholder: string;
  submitReview: string;
  reviewSubmitted: string;
  adminPortal: string;
  customerView: string;
  customerInfoTitle: string;
  customerInfoSubtitle: string;
  customerNameLabel: string;
  customerNamePlaceholder: string;
  customerPhoneLabel: string;
  customerPhonePlaceholder: string;
  tableNumberLabel: string;
  guestsCountLabel: string;
  startOrderingBtn: string;
  enterValidName: string;
  enterValidPhone: string;
  enterValidTable: string;
  customerBadgeText: string;
  editInfoBtn: string;
  trackOrderTab: string;
  customerLoginTitle: string;
  trackByMobileDesc: string;
  noOrdersFound: string;
  newSessionTab: string;
  existingCustomerTab: string;
}

export const translations: Record<Language, TranslationStrings> = {
  en: {
    brandTitle: 'ScanDine',
    brandTagline: 'Smart QR-Based Hotel Table Ordering System',
    collegeHeader: 'Sanjivani College of Engineering, Kopargaon',
    seatedAtTable: 'Seated at Table',
    selectYourTable: 'Select Your Table',
    table: 'Table',
    tableShort: 'Tbl',
    searchPlaceholder: 'Search dishes, chai, snacks, combos...',
    categoryAll: 'All Items',
    categoryChai: 'Chai & Hot Teas',
    categorySnacks: 'Buns & Snacks',
    categoryMain: 'Meals & Mains',
    categoryDessert: 'Desserts & Sweets',
    addToOrder: 'Add to Order',
    addedToast: 'Added to your order',
    outOfStock: 'Sold Out',
    vegOnly: 'Veg Only',
    nonVegOnly: 'Non-Veg',
    callWaiter: 'Call Waiter',
    callingWaiter: 'Calling...',
    waiterCalledSuccess: 'Staff notified! A waiter will attend your table shortly.',
    selectAssistance: 'What assistance do you need?',
    needWater: 'Drinking Water',
    needBill: 'Request Final Bill',
    needCutlery: 'Extra Cutlery / Plates',
    generalHelp: 'General Assistance',
    cancel: 'Cancel',
    confirmCall: 'Call Waiter to Table',
    yourCart: 'Your Order Tray',
    emptyCart: 'Your tray is currently empty. Browse our menu to add fresh delicacies!',
    exploreMenu: 'Explore Menu',
    specialInstructions: 'Cooking / Dining Instructions',
    specialInstructionsPlaceholder: 'E.g. Less spicy, extra butter, no sugar in tea...',
    itemNotesPlaceholder: 'Customization (e.g. extra crisp)...',
    totalPayable: 'Total Payable',
    placeOrder: 'Confirm & Send to Kitchen',
    placingOrder: 'Transmitting Order...',
    orderReceivedTitle: 'Order Placed Successfully',
    orderReceivedSubtitle: 'Your order has been sent to the kitchen. Real-time updates appear below.',
    orderNumber: 'Order Number',
    orderStatus: 'Live Kitchen Status',
    statusPending: 'Order Received',
    statusPreparing: 'Preparing in Kitchen',
    statusReady: 'Ready for Serving',
    statusServed: 'Served at Table',
    statusCompleted: 'Order Completed',
    statusCancelled: 'Cancelled',
    statusPendingDesc: 'Received by kitchen staff. Waiting for chef acceptance.',
    statusPreparingDesc: 'Chef is preparing your meal fresh.',
    statusReadyDesc: 'Food is ready and plated for table service.',
    statusServedDesc: 'Delivered to your table. Enjoy your meal!',
    statusCompletedDesc: 'Dining session completed. Thank you!',
    orderMore: 'Order More Items',
    rateExperience: 'Rate & Review Your Dining Experience',
    feedbackPlaceholder: 'How was the food, hygiene, and table service? (Optional)',
    submitReview: 'Submit Review',
    reviewSubmitted: 'Thank you! Your feedback helps us serve you better.',
    adminPortal: 'Staff Portal',
    customerView: 'Customer Menu',
    customerInfoTitle: 'Welcome! Please Enter Your Details',
    customerInfoSubtitle: 'Please enter your name and phone number to begin ordering. This ensures accurate table service with zero confusion.',
    customerNameLabel: 'Full Name *',
    customerNamePlaceholder: 'Enter your name (e.g. Rahul Sharma)',
    customerPhoneLabel: 'Mobile Number *',
    customerPhonePlaceholder: '10-digit mobile number',
    tableNumberLabel: 'Table Number *',
    guestsCountLabel: 'Number of Guests',
    startOrderingBtn: 'Confirm & View Digital Menu',
    enterValidName: 'Please enter your name (at least 2 letters)',
    enterValidPhone: 'Please enter a valid 10-digit mobile number',
    enterValidTable: 'Please select or enter a valid table number',
    customerBadgeText: 'Ordering as',
    editInfoBtn: 'Edit Details',
    trackOrderTab: 'Track Order',
    customerLoginTitle: 'Customer Sign In & Live Order Tracker',
    trackByMobileDesc: 'Enter your 10-digit mobile number or order number to see live status of your order in the kitchen.',
    noOrdersFound: 'No active orders found for this mobile number or order number. Please check or place a new order.',
    newSessionTab: 'New Customer',
    existingCustomerTab: 'Already Ordered? Sign In'
  },
  hi: {
    brandTitle: 'स्कैनडाइन (ScanDine)',
    brandTagline: 'स्मार्ट क्यूआर होटल टेबल ऑर्डरिंग सिस्टम',
    collegeHeader: 'संजीवनी कॉलेज ऑफ इंजीनियरिंग, कोपरगाव',
    seatedAtTable: 'टेबल नंबर पर बैठे हैं',
    selectYourTable: 'अपनी टेबल चुनें',
    table: 'टेबल',
    tableShort: 'टेबल',
    searchPlaceholder: 'व्यंजन, चाय, नाश्ता खोजें...',
    categoryAll: 'सभी व्यंजन',
    categoryChai: 'चाय एवं गरम पेय',
    categorySnacks: 'बन एवं स्नैक्स',
    categoryMain: 'भोजन एवं मुख्य व्यंजन',
    categoryDessert: 'मिठाइयाँ एवं डेसर्ट',
    addToOrder: 'ऑर्डर में जोड़ें',
    addedToast: 'ऑर्डर में जोड़ा गया',
    outOfStock: 'समाप्त (उपलब्ध नहीं)',
    vegOnly: 'शाकाहारी (वेज)',
    nonVegOnly: 'मांसाहारी (नॉन-वेज)',
    callWaiter: 'वेटर को बुलाएँ',
    callingWaiter: 'सूचना भेजी जा रही है...',
    waiterCalledSuccess: 'स्टाफ को सूचित कर दिया गया है! वेटर जल्द ही आपकी टेबल पर आएगा।',
    selectAssistance: 'आपको क्या सहायता चाहिए?',
    needWater: 'पीने का पानी',
    needBill: 'बिल चाहिए',
    needCutlery: 'अतिरिक्त चम्मच / प्लेट',
    generalHelp: 'सामान्य सहायता',
    cancel: 'रद्द करें',
    confirmCall: 'टेबल पर वेटर बुलाएँ',
    yourCart: 'आपकी ऑर्डर थाली',
    emptyCart: 'आपकी थाली अभी खाली है। ताज़ा व्यंजन जोड़ने के लिए मेनू देखें!',
    exploreMenu: 'मेनू देखें',
    specialInstructions: 'रसोई / तैयारी निर्देश',
    specialInstructionsPlaceholder: 'जैसे: कम तीखा, चाय में कम शक्कर, अतिरिक्त मक्खन...',
    itemNotesPlaceholder: 'अनुकूलन (जैसे: कुरकुरा)...',
    totalPayable: 'कुल देय राशि',
    placeOrder: 'रसोई में ऑर्डर भेजें',
    placingOrder: 'ऑर्डर भेजा जा रहा है...',
    orderReceivedTitle: 'ऑर्डर सफलतापूर्वक भेजा गया',
    orderReceivedSubtitle: 'आपका ऑर्डर रसोई में पहुँच गया है। लाइव स्थिति नीचे देखें।',
    orderNumber: 'ऑर्डर क्रमांक',
    orderStatus: 'लाइव रसोई स्थिति',
    statusPending: 'ऑर्डर प्राप्त हुआ',
    statusPreparing: 'रसोई में तैयार हो रहा है',
    statusReady: 'परोसने के लिए तैयार',
    statusServed: 'टेबल पर परोसा गया',
    statusCompleted: 'ऑर्डर पूर्ण हुआ',
    statusCancelled: 'रद्द किया गया',
    statusPendingDesc: 'रसोई स्टाफ को ऑर्डर मिल गया है।',
    statusPreparingDesc: 'शेफ आपका ताज़ा भोजन तैयार कर रहे हैं।',
    statusReadyDesc: 'भोजन तैयार है और टेबल पर लाया जा रहा है।',
    statusServedDesc: 'आपकी टेबल पर परोस दिया गया है। भोजन का आनंद लें!',
    statusCompletedDesc: 'भोजन सत्र समाप्त हुआ। धन्यवाद!',
    orderMore: 'और व्यंजन ऑर्डर करें',
    rateExperience: 'भोजन एवं सेवा की समीक्षा दें',
    feedbackPlaceholder: 'भोजन, स्वच्छता और सेवा कैसी लगी? (वैकल्पिक)',
    submitReview: 'प्रतिक्रिया भेजें',
    reviewSubmitted: 'धन्यवाद! आपकी समीक्षा हमारे लिए महत्वपूर्ण है।',
    adminPortal: 'कर्मचारी पोर्टल',
    customerView: 'ग्राहक मेनू',
    customerInfoTitle: 'स्वागत है! कृपया अपनी जानकारी दर्ज करें',
    customerInfoSubtitle: 'ऑर्डर शुरू करने से पहले अपना नाम और फोन नंबर दर्ज करें ताकि आपके टेबल पर बिना किसी भ्रम के सही सेवा दी जा सके।',
    customerNameLabel: 'पूरा नाम *',
    customerNamePlaceholder: 'अपना नाम दर्ज करें (जैसे राहुल शर्मा)',
    customerPhoneLabel: 'मोबाइल नंबर *',
    customerPhonePlaceholder: '१० अंकों का मोबाइल नंबर',
    tableNumberLabel: 'टेबल क्रमांक *',
    guestsCountLabel: 'अतिथियों की संख्या',
    startOrderingBtn: 'पुष्टि करें और मेनू देखें',
    enterValidName: 'कृपया अपना सही नाम दर्ज करें (कम से कम २ अक्षर)',
    enterValidPhone: 'कृपया सही १० अंकों का मोबाइल नंबर दर्ज करें',
    enterValidTable: 'कृपया सही टेबल नंबर दर्ज करें',
    customerBadgeText: 'ग्राहक',
    editInfoBtn: 'विवरण बदलें',
    trackOrderTab: 'ऑर्डर ट्रैक करें',
    customerLoginTitle: 'ग्राहक लॉगिन व लाइव ऑर्डर ट्रैकर',
    trackByMobileDesc: 'अपनी रसोई ऑर्डर की वास्तविक स्थिति देखने के लिए अपना 10 अंकों का मोबाइल नंबर या ऑर्डर नंबर दर्ज करें।',
    noOrdersFound: 'इस मोबाइल नंबर या ऑर्डर नंबर पर कोई सक्रिय ऑर्डर नहीं मिला। कृपया पुनः जांचें या नया ऑर्डर करें।',
    newSessionTab: 'नया ग्राहक',
    existingCustomerTab: 'पहले से ऑर्डर किया है? लॉगिन करें'
  },
  mr: {
    brandTitle: 'स्कॅनडाइन (ScanDine)',
    brandTagline: 'स्मार्ट क्यूआर हॉटेल टेबल ऑर्डरिंग प्रणाली',
    collegeHeader: 'संजीवनी कॉलेज ऑफ इंजिनिअरिंग, कोपरगाव',
    seatedAtTable: 'टेबल नंबरवर बसलेले आहात',
    selectYourTable: 'आपले टेबल निवडा',
    table: 'टेबल',
    tableShort: 'टेबल',
    searchPlaceholder: 'पदार्थ, गरमागरम चहा, स्नॅक्स शोधा...',
    categoryAll: 'सर्व पदार्थ',
    categoryChai: 'चहा आणि गरम पेये',
    categorySnacks: 'बन आणि स्नॅक्स',
    categoryMain: 'जेवण आणि मुख्य पदार्थ',
    categoryDessert: 'गोड पदार्थ आणि डेझर्ट',
    addToOrder: 'ऑर्डरमध्ये जोडा',
    addedToast: 'ऑर्डरमध्ये जोडले गेले',
    outOfStock: 'संपले (उपलब्ध नाही)',
    vegOnly: 'शाकाहारी (व्हेज)',
    nonVegOnly: 'मांसाहारी (नॉन-व्हेज)',
    callWaiter: 'वेटरला बोलवा',
    callingWaiter: 'सूचना पाठवत आहे...',
    waiterCalledSuccess: 'हॉटेल कर्मचाऱ्यांना कळवले आहे! वेटर लवकरच आपल्या टेबलवर येईल.',
    selectAssistance: 'आपणास कसली मदत हवी आहे?',
    needWater: 'पिण्याचे पाणी',
    needBill: 'हॉटेलचे बिल हवे आहे',
    needCutlery: 'जादा चमचे / प्लेट्स',
    generalHelp: 'इतर मदत',
    cancel: 'रद्द करा',
    confirmCall: 'टेबलवर वेटरला बोलवा',
    yourCart: 'आपली ऑर्डर थाळी',
    emptyCart: 'आपली ऑर्डर थाळी रिकामी आहे. चवदार पदार्थ जोडण्यासाठी मेनू पहा!',
    exploreMenu: 'मेनू पहा',
    specialInstructions: 'विशेष सूचना (कमी तिखट/कमी साखर)',
    specialInstructionsPlaceholder: 'उदा. कमी तिखट, चहात कमी साखर, जादा बटर...',
    itemNotesPlaceholder: 'काही खास सूचना...',
    totalPayable: 'एकूण देय रक्कम',
    placeOrder: 'किचनमध्ये ऑर्डर पाठवा',
    placingOrder: 'ऑर्डर पाठवत आहे...',
    orderReceivedTitle: 'ऑर्डर यशस्वीरीत्या नोंदवली गेली',
    orderReceivedSubtitle: 'आपली ऑर्डर किचनमध्ये पोहोचली आहे. प्रत्यक्ष प्रगती खाली पहा.',
    orderNumber: 'ऑर्डर क्रमांक',
    orderStatus: 'थेट किचन प्रगती',
    statusPending: 'ऑर्डर मिळाली',
    statusPreparing: 'किचनमध्ये तयार होत आहे',
    statusReady: 'सर्व्ह करण्यासाठी तयार',
    statusServed: 'टेबलवर दिले गेले',
    statusCompleted: 'ऑर्डर पूर्ण झाली',
    statusCancelled: 'रद्द केली',
    statusPendingDesc: 'किचन टीमला ऑर्डर मिळाली आहे.',
    statusPreparingDesc: 'आचारी आपले ताजे जेवण तयार करत आहेत.',
    statusReadyDesc: 'गरमागरम पदार्थ तयार आहेत आणि टेबलवर आणले जात आहेत.',
    statusServedDesc: 'आपल्या टेबलवर पदार्थ दिले गेले आहेत. जेवणाचा आस्वाद घ्या!',
    statusCompletedDesc: 'जेवण पूर्ण झाले. धन्यवाद!',
    orderMore: 'आणखी पदार्थ मागवा',
    rateExperience: 'आपला जेवणाचा अनुभव कसा होता?',
    feedbackPlaceholder: 'जेवणाची चव, स्वच्छता आणि सेवेबद्दल आपला अभिप्राय लिहा... (ऐच्छिक)',
    submitReview: 'अभिप्राय पाठवा',
    reviewSubmitted: 'धन्यवाद! आपला अभिप्राय आमच्यासाठी मोलाचा आहे.',
    adminPortal: 'स्टाफ पोर्टल',
    customerView: 'ग्राहक मेनू',
    customerInfoTitle: 'स्वागत आहे! कृपया आपली माहिती भरा',
    customerInfoSubtitle: 'ऑर्डर सुरू करण्यापूर्वी आपले नाव आणि मोबाईल नंबर भरा जेणेकरून आपल्या टेबलवर कोणत्याही गोंधळाशिवाय अचूक सेवा देता येईल.',
    customerNameLabel: 'पूर्ण नाव *',
    customerNamePlaceholder: 'आपले नाव प्रविष्ट करा (उदा. राहुल शर्मा)',
    customerPhoneLabel: 'मोबाईल नंबर *',
    customerPhonePlaceholder: '१० अंकी मोबाईल नंबर',
    tableNumberLabel: 'टेबल क्रमांक *',
    guestsCountLabel: 'व्यक्तींची संख्या',
    startOrderingBtn: 'पुष्टी करा आणि मेनू उघडा',
    enterValidName: 'कृपया आपले नाव प्रविष्ट करा (किमान २ अक्षरे)',
    enterValidPhone: 'कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा',
    enterValidTable: 'कृपया योग्य टेबल नंबर निवडा',
    customerBadgeText: 'ग्राहक',
    editInfoBtn: 'माहिती बदला',
    trackOrderTab: 'ऑर्डर पहा',
    customerLoginTitle: 'ग्राहक लॉगिन आणि थेट ऑर्डर प्रगती',
    trackByMobileDesc: 'आपल्या किचन ऑर्डरची थेट प्रगती पाहण्यासाठी १० अंकी मोबाईल नंबर किंवा ऑर्डर क्रमांक टाका.',
    noOrdersFound: 'या मोबाईल किंवा ऑर्डर क्रमांकावर कोणतीही ऑर्डर सापडली नाही. कृपया तपासणी करा किंवा नवीन ऑर्डर द्या.',
    newSessionTab: 'नवीन ग्राहक',
    existingCustomerTab: 'आधीच ऑर्डर केली आहे? लॉगिन'
  }
};
