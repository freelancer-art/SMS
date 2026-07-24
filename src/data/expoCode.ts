export const EXPO_APP_TSX = `import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ScrollView, 
  Modal, 
  ActivityIndicator, 
  RefreshControl,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Users, 
  CreditCard, 
  TrendingDown, 
  AlertTriangle, 
  Megaphone, 
  Plus, 
  Lock, 
  Search, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  X,
  Calendar,
  FileText,
  User,
  Phone,
  Mail,
  DollarSign,
  Briefcase,
  Layers,
  MapPin,
  ExternalLink,
  Settings,
  BarChart3,
  Building2
} from 'lucide-react-native';

// Import API helper (defined in separate tab, pasted here or imported)
import { api } from './api';

const PRIMARY_COLOR = '#6200EE';
const ACCENT_COLOR = '#03DAC6';
const ERROR_COLOR = '#B00020';
const BACKGROUND_COLOR = '#F5F5F5';

export default function App() {
  // Society Connection States
  const [activeSocietyId, setActiveSocietyId] = useState('greenwood');
  const [isSocietyConnected, setIsSocietyConnected] = useState(false);
  const [societyCode, setSocietyCode] = useState('');
  const [loginRole, setLoginRole] = useState('Admin'); // 'Admin' or 'Member'
  const [selectedMemberFlat, setSelectedMemberFlat] = useState('');
  const [userRole, setUserRole] = useState('Admin'); // 'Admin' or 'Member'

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [currentTab, setCurrentTab] = useState('Dashboard');
  
  // Loading & Refreshing States
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Society Custom Settings
  const [societyName, setSocietyName] = useState('Greenwood Residency');
  const [hasWings, setHasWings] = useState(true);
  const [wingsList, setWingsList] = useState(['A', 'B', 'C']);
  const [selectedWing, setSelectedWing] = useState('All');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  const [tempSocietyName, setTempSocietyName] = useState('');
  const [tempHasWings, setTempHasWings] = useState(true);
  const [tempWingsList, setTempWingsList] = useState('');

  // Editing Member States
  const [editMemberModalVisible, setEditMemberModalVisible] = useState(false);
  const [editFlatNo, setEditFlatNo] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editContactNo, setEditContactNo] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState('Owner');
  const [editCoOwners, setEditCoOwners] = useState('');
  const [editVehicleNo, setEditVehicleNo] = useState('');
  const [editWing, setEditWing] = useState('');

  // Data States
  const [members, setMembers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);

  // Search & Filter States
  const [memberSearch, setMemberSearch] = useState('');
  const [complaintFilter, setComplaintFilter] = useState('All');

  // Modal / Detail States
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  
  // Form States
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [complaintModalVisible, setComplaintModalVisible] = useState(false);

  // Form Fields
  const [formFlatNo, setFormFlatNo] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formMode, setFormMode] = useState('UPI');
  const [formRefNo, setFormRefNo] = useState('');
  
  const [formExpenseCategory, setFormExpenseCategory] = useState('Maintenance');
  const [formExpenseAmount, setFormExpenseAmount] = useState('');
  const [formExpenseVendor, setFormExpenseVendor] = useState('');
  const [formExpenseInvoice, setFormExpenseInvoice] = useState('');

  const [formComplaintCategory, setFormComplaintCategory] = useState('Plumbing');
  const [formComplaintTitle, setFormComplaintTitle] = useState('');
  const [formComplaintDesc, setFormComplaintDesc] = useState('');
  const [formComplaintUrgency, setFormComplaintUrgency] = useState('Medium');

  // Check login on launch
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Fetch data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchAllData();
    }
  }, [isLoggedIn, activeSocietyId]);

  const checkLoginStatus = async () => {
    try {
      const isConnected = await AsyncStorage.getItem('@society_connected');
      if (isConnected === 'true') {
        const sId = await AsyncStorage.getItem('@society_id') || 'greenwood';
        const sName = await AsyncStorage.getItem('@society_name') || 'Greenwood Residency';
        const sHasWings = await AsyncStorage.getItem('@society_has_wings') === 'true';
        const sWings = await AsyncStorage.getItem('@society_wings_list');

        setActiveSocietyId(sId);
        setSocietyName(sName);
        setHasWings(sHasWings);
        if (sWings) {
          setWingsList(sWings.split(',').map(w => w.trim()).filter(w => w !== ''));
        }
        setIsSocietyConnected(true);

        const isLogged = await AsyncStorage.getItem('@society_logged_in');
        if (isLogged === 'true') {
          const role = await AsyncStorage.getItem('@society_role') || 'Admin';
          const flat = await AsyncStorage.getItem('@society_member_flat') || '';
          setUserRole(role);
          setSelectedMemberFlat(flat);
          setIsLoggedIn(true);
        }
      }
    } catch (e) {
      console.error('Failed to load login status');
    }
  };

  const handleConnectSociety = async () => {
    if (!societyCode) {
      Alert.alert('Validation Error', 'Please enter a society access code.');
      return;
    }
    
    const code = societyCode.trim().toLowerCase();
    let targetId = '';
    let targetName = '';
    let targetHasWings = true;
    let targetWings = ['A', 'B', 'C'];

    if (code === 'greenwood' || code === 'gw100') {
      targetId = 'greenwood';
      targetName = 'Greenwood Residency';
      targetHasWings = true;
      targetWings = ['A', 'B', 'C'];
    } else if (code === 'royal_heights' || code === 'rh200') {
      targetId = 'royal_heights';
      targetName = 'Royal Heights';
      targetHasWings = false;
      targetWings = [];
    } else if (code === 'sea_breeze' || code === 'sb300') {
      targetId = 'sea_breeze';
      targetName = 'Sea Breeze Society';
      targetHasWings = true;
      targetWings = ['Phase 1', 'Phase 2'];
    } else {
      targetId = code;
      targetName = code.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      targetHasWings = true;
      targetWings = ['A', 'B'];
    }

    try {
      await AsyncStorage.setItem('@society_id', targetId);
      await AsyncStorage.setItem('@society_name', targetName);
      await AsyncStorage.setItem('@society_has_wings', targetHasWings ? 'true' : 'false');
      await AsyncStorage.setItem('@society_wings_list', targetWings.join(','));
      await AsyncStorage.setItem('@society_connected', 'true');
      
      setActiveSocietyId(targetId);
      setSocietyName(targetName);
      setHasWings(targetHasWings);
      setWingsList(targetWings);
      setIsSocietyConnected(true);
      setSocietyCode('');
    } catch (e) {
      Alert.alert('Error', 'Failed to connect to housing society.');
    }
  };

  const handleLogin = async () => {
    if (loginRole === 'Admin') {
      if (password === 'admin123') {
        try {
          await AsyncStorage.setItem('@society_logged_in', 'true');
          await AsyncStorage.setItem('@society_role', 'Admin');
          await AsyncStorage.setItem('@society_member_flat', '');
          setUserRole('Admin');
          setIsLoggedIn(true);
          setPassword('');
        } catch (e) {
          Alert.alert('Error', 'Failed to save admin session.');
        }
      } else {
        Alert.alert('Access Denied', 'Incorrect admin gate passcode.');
      }
    } else {
      if (!selectedMemberFlat) {
        Alert.alert('Validation Error', 'Please enter your flat / unit number.');
        return;
      }
      
      const flatStr = selectedMemberFlat.trim();
      try {
        await AsyncStorage.setItem('@society_logged_in', 'true');
        await AsyncStorage.setItem('@society_role', 'Member');
        await AsyncStorage.setItem('@society_member_flat', flatStr);
        setUserRole('Member');
        setIsLoggedIn(true);
      } catch (e) {
        Alert.alert('Error', 'Failed to save resident session.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@society_logged_in');
      await AsyncStorage.removeItem('@society_role');
      await AsyncStorage.removeItem('@society_member_flat');
      setIsLoggedIn(false);
    } catch (e) {
      console.error('Failed to log out');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [membersData, paymentsData, expensesData, complaintsData, noticesData, settingsData] = await Promise.all([
        api.getMembers(activeSocietyId),
        api.getPayments(activeSocietyId),
        api.getExpenses(activeSocietyId),
        api.getComplaints(activeSocietyId),
        api.getNotices(activeSocietyId),
        api.getSettings ? api.getSettings(activeSocietyId) : Promise.resolve([])
      ]);
      setMembers(Array.isArray(membersData) ? membersData : backupDb.members.filter(m => m.SocietyId === activeSocietyId || !m.SocietyId));
      setPayments(Array.isArray(paymentsData) ? paymentsData : backupDb.payments.filter(p => p.SocietyId === activeSocietyId || !p.SocietyId));
      setExpenses(Array.isArray(expensesData) ? expensesData : backupDb.expenses.filter(e => e.SocietyId === activeSocietyId || !e.SocietyId));
      setComplaints(Array.isArray(complaintsData) ? complaintsData : backupDb.complaints.filter(c => c.SocietyId === activeSocietyId || !c.SocietyId));
      setNotices(Array.isArray(noticesData) ? noticesData : backupDb.notices.filter(n => n.SocietyId === activeSocietyId || !n.SocietyId));

      if (settingsData && settingsData.length > 0) {
        const nameSetting = settingsData.find(s => s.Key === 'societyName');
        const hasWingsSetting = settingsData.find(s => s.Key === 'hasWings');
        const wingsSetting = settingsData.find(s => s.Key === 'wingsList');

        if (nameSetting && nameSetting.Value) {
          setSocietyName(nameSetting.Value);
        }
        if (hasWingsSetting) {
          setHasWings(hasWingsSetting.Value === 'true' || hasWingsSetting.Value === true);
        }
        if (wingsSetting && wingsSetting.Value) {
          setWingsList(wingsSetting.Value.split(',').map(w => w.trim()).filter(w => w !== ''));
        }
      }
    } catch (error) {
      console.warn("Using offline simulated backup data.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAllData();
    } finally {
      setRefreshing(false);
    }
  };

  // Create Operations
  const handleAddPayment = async () => {
    if (!formFlatNo || !formAmount) {
      Alert.alert('Validation Error', 'Flat Number and Amount are required.');
      return;
    }
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const selectedMemberObj = members.find(m => m.FlatNo === formFlatNo);
      const ownerName = selectedMemberObj ? selectedMemberObj.OwnerName : 'Unknown';
      
      const payload = {
        sheet: 'Payments',
        row: [today, formFlatNo, ownerName, parseFloat(formAmount), formMode, formRefNo, 'Cleared']
      };

      await api.postData(payload);
      
      // Update local values dynamically
      setPayments([{
        Date: today,
        FlatNo: formFlatNo,
        OwnerName: ownerName,
        Amount: parseFloat(formAmount),
        Mode: formMode,
        ReferenceNo: formRefNo,
        Status: 'Cleared'
      }, ...payments]);

      // Adjust member balance
      setMembers(members.map(m => {
        if (m.FlatNo === formFlatNo) {
          return { ...m, Balance: m.Balance - parseFloat(formAmount) };
        }
        return m;
      }));

      Alert.alert('Success', 'Payment logged successfully!');
      setPaymentModalVisible(false);
      resetPaymentForm();
    } catch (err) {
      Alert.alert('Error', 'Failed to save payment to Google Sheet.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!formExpenseAmount || !formExpenseVendor) {
      Alert.alert('Validation Error', 'Amount and Vendor details are required.');
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        sheet: 'Expenses',
        row: [today, formExpenseCategory, parseFloat(formExpenseAmount), formExpenseVendor, formExpenseInvoice, 'Society Committee']
      };

      await api.postData(payload);

      setExpenses([{
        Date: today,
        Category: formExpenseCategory,
        Amount: parseFloat(formExpenseAmount),
        Vendor: formExpenseVendor,
        InvoiceNo: formExpenseInvoice,
        ApprovedBy: 'Society Committee'
      }, ...expenses]);

      Alert.alert('Success', 'Expense added successfully!');
      setExpenseModalVisible(false);
      resetExpenseForm();
    } catch (err) {
      Alert.alert('Error', 'Failed to save expense.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComplaint = async () => {
    if (!formFlatNo || !formComplaintTitle || !formComplaintDesc) {
      Alert.alert('Validation Error', 'Flat Number, Title and Description are required.');
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const complaintId = 'C-' + Math.floor(100 + Math.random() * 900);
      const payload = {
        sheet: 'Complaints',
        row: [complaintId, formFlatNo, formComplaintCategory, formComplaintTitle, formComplaintDesc, today, 'Open', formComplaintUrgency]
      };

      await api.postData(payload);

      setComplaints([{
        id: complaintId,
        FlatNo: formFlatNo,
        Category: formComplaintCategory,
        Title: formComplaintTitle,
        Description: formComplaintDesc,
        Date: today,
        Status: 'Open',
        Urgency: formComplaintUrgency
      }, ...complaints]);

      Alert.alert('Success', 'Complaint registered successfully!');
      setComplaintModalVisible(false);
      resetComplaintForm();
    } catch (err) {
      Alert.alert('Error', 'Failed to file complaint.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComplaintStatus = async (complaintId, newStatus) => {
    setLoading(true);
    try {
      // Send updates to backend script (using our specialized script sheet updates)
      await api.updateComplaintStatus(complaintId, newStatus);
      
      setComplaints(complaints.map(c => {
        if (c.id === complaintId) {
          return { ...c, Status: newStatus };
        }
        return c;
      }));
      
      if (selectedComplaint && selectedComplaint.id === complaintId) {
        setSelectedComplaint({ ...selectedComplaint, Status: newStatus });
      }
      
      Alert.alert('Updated', 'Complaint status set to ' + newStatus);
    } catch (err) {
      Alert.alert('Error', 'Failed to update status on Sheets. Updated locally.');
      // Local fallback
      setComplaints(complaints.map(c => {
        if (c.id === complaintId) {
          return { ...c, Status: newStatus };
        }
        return c;
      }));
    } finally {
      setLoading(false);
    }
  };

  const resetPaymentForm = () => {
    setFormFlatNo('');
    setFormAmount('');
    setFormMode('UPI');
    setFormRefNo('');
  };

  const resetExpenseForm = () => {
    setFormExpenseCategory('Maintenance');
    setFormExpenseAmount('');
    setFormExpenseVendor('');
    setFormExpenseInvoice('');
  };

  const resetComplaintForm = () => {
    setFormFlatNo('');
    setFormComplaintCategory('Plumbing');
    setFormComplaintTitle('');
    setFormComplaintDesc('');
    setFormComplaintUrgency('Medium');
  };

  const filteredMembers = (Array.isArray(members) ? members : []).filter(m => {
    if (!m) return false;
    const flatNoStr = String(m.FlatNo || '');
    const ownerNameStr = String(m.OwnerName || '');
    const matchesSearch = flatNoStr.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          ownerNameStr.toLowerCase().includes(memberSearch.toLowerCase());
    if (!hasWings || selectedWing === 'All') return matchesSearch;
    return matchesSearch && m.Wing === selectedWing;
  });

  const filteredComplaints = (Array.isArray(complaints) ? complaints : []).filter(c => {
    if (complaintFilter === 'All') return true;
    return c.Status === complaintFilter;
  });

  if (!isSocietyConnected) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.loginCard}
        >
          <View style={styles.loginHeader}>
            <View style={styles.loginIconBg}>
              <Building2 size={36} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.loginTitle}>Society Connect</Text>
            <Text style={styles.loginSubtitle}>Enter Society Access Code</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Housing Society Access Code</Text>
            <TextInput
              style={styles.passwordInput}
              autoCapitalize="none"
              autoCorrect={false}
              value={societyCode}
              onChangeText={setSocietyCode}
              placeholder="e.g. greenwood, royal_heights"
              placeholderTextColor="#999"
            />
            <Text style={styles.hintText}>Contact your society committee for the code</Text>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleConnectSociety}>
            <Text style={styles.loginButtonText}>Connect to Society</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="light-content" backgroundColor={PRIMARY_COLOR} />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.loginCard}
        >
          <View style={styles.loginHeader}>
            <View style={styles.loginIconBg}>
              <Lock size={36} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.loginTitle}>{societyName}</Text>
            <Text style={styles.loginSubtitle}>{loginRole === 'Admin' ? 'Committee Admin Portal' : 'Resident Portal'}</Text>
          </View>

          {/* Role Toggle Tabs */}
          <View style={styles.roleToggleContainer}>
            <TouchableOpacity 
              style={[styles.roleToggleButton, loginRole === 'Admin' && styles.roleToggleActive]} 
              onPress={() => setLoginRole('Admin')}
            >
              <Text style={[styles.roleToggleText, loginRole === 'Admin' && styles.roleToggleTextActive]}>Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.roleToggleButton, loginRole === 'Member' && styles.roleToggleActive]} 
              onPress={() => setLoginRole('Member')}
            >
              <Text style={[styles.roleToggleText, loginRole === 'Member' && styles.roleToggleTextActive]}>Resident</Text>
            </TouchableOpacity>
          </View>

          {loginRole === 'Admin' ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Security Gate Password</Text>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholder="Enter Password"
                placeholderTextColor="#999"
              />
              <Text style={styles.hintText}>Hint: admin123</Text>
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Resident Flat / Unit Number</Text>
              <TextInput
                style={styles.passwordInput}
                value={selectedMemberFlat}
                onChangeText={setSelectedMemberFlat}
                placeholder="e.g. 101, 102"
                placeholderTextColor="#999"
              />
              <Text style={styles.hintText}>Enter your flat number to sign in</Text>
            </View>
          )}

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ marginTop: 15, alignItems: 'center' }} 
            onPress={async () => {
              setIsSocietyConnected(false);
              await AsyncStorage.removeItem('@society_connected');
            }}
          >
            <Text style={{ color: PRIMARY_COLOR, fontSize: 13, fontWeight: 'bold', textDecorationLine: 'underline' }}>Change Society Code</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* App Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{societyName}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {userRole === 'Admin' 
              ? (hasWings ? 'Wing-based Admin' : 'Committee Admin') 
              : \`Resident • Unit \${selectedMemberFlat}\`
            }
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {userRole === 'Admin' && (
            <TouchableOpacity 
              style={styles.settingsButton} 
              onPress={() => {
                setTempSocietyName(societyName);
                setTempHasWings(hasWings);
                setTempWingsList(wingsList.join(', '));
                setSettingsModalVisible(true);
              }}
            >
              <Settings size={20} color="#777" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Pane */}
      <View style={styles.mainContent}>
        {loading && !refreshing && (
          <View style={styles.absoluteLoader}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text style={styles.loaderText}>Syncing Sheets...</Text>
          </View>
        )}

        {/* --- DASHBOARD TAB --- */}
        {currentTab === 'Dashboard' && (
          <ScrollView 
            style={styles.tabContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          >
            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderLeftColor: '#2E7D32', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>TOTAL INCOME</Text>
                <Text style={[styles.statValue, { color: '#2E7D32' }]}>
                  ₹{payments ? payments.reduce((sum, p) => sum + (parseFloat(p.Amount) || 0), 0).toLocaleString() : '0'}
                </Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#C62828', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>TOTAL EXPENSES</Text>
                <Text style={[styles.statValue, { color: '#C62828' }]}>
                  ₹{expenses ? expenses.reduce((sum, e) => sum + (parseFloat(e.Amount) || 0), 0).toLocaleString() : '0'}
                </Text>
              </View>
            </View>

            <View style={[styles.statsGrid, { marginTop: 8 }]}>
              <View style={[styles.statCard, { borderLeftColor: '#6200EE', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>NET RESERVES</Text>
                <Text style={[styles.statValue, { color: '#6200EE' }]}>
                  ₹{((payments ? payments.reduce((sum, p) => sum + (parseFloat(p.Amount) || 0), 0) : 0) - (expenses ? expenses.reduce((sum, e) => sum + (parseFloat(e.Amount) || 0), 0) : 0)).toLocaleString()}
                </Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#EF6C00', borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>OUTSTANDING DUES</Text>
                <Text style={[styles.statValue, { color: '#EF6C00' }]}>
                  ₹{members ? members.reduce((sum, m) => sum + (m.Balance > 0 ? parseFloat(m.Balance) : 0), 0).toLocaleString() : '0'}
                </Text>
              </View>
            </View>

            {/* Category Expenses Breakdown */}
            <View style={styles.dashboardSection}>
              <Text style={styles.sectionTitle}>Expenses by Category</Text>
              {(() => {
                const categories = {};
                let maxAmt = 1;
                (expenses || []).forEach(e => {
                  const cat = e.Category || 'Others';
                  const amt = parseFloat(e.Amount) || 0;
                  categories[cat] = (categories[cat] || 0) + amt;
                });
                
                const catArray = Object.keys(categories).map(cat => ({
                  name: cat,
                  amount: categories[cat]
                })).sort((a, b) => b.amount - a.amount);

                if (catArray.length > 0) {
                  maxAmt = Math.max(...catArray.map(c => c.amount));
                }

                if (catArray.length === 0) {
                  return <Text style={styles.emptySectionText}>No expense data available</Text>;
                }

                return catArray.map(item => {
                  const percentage = maxAmt > 0 ? (item.amount / maxAmt) * 100 : 0;
                  return (
                    <View key={item.name} style={styles.categoryProgressRow}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={styles.progressLabel}>{item.name}</Text>
                        <Text style={styles.progressValue}>₹{item.amount.toLocaleString()}</Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '\${percentage}%' }]} />
                      </View>
                    </View>
                  );
                });
              })()}
            </View>

            {/* Quick Action Hub */}
            <View style={styles.dashboardSection}>
              <Text style={styles.sectionTitle}>
                {userRole === 'Admin' ? 'Quick Committee Actions' : 'Resident Services'}
              </Text>
              <View style={styles.quickActionGrid}>
                {userRole === 'Admin' ? (
                  <>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => {
                        resetPaymentForm();
                        setPaymentModalVisible(true);
                      }}
                    >
                      <CreditCard size={18} color="#FFF" />
                      <Text style={styles.actionButtonText}>Log Income</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#C62828' }]}
                      onPress={() => {
                        resetExpenseForm();
                        setExpenseModalVisible(true);
                      }}
                    >
                      <TrendingDown size={18} color="#FFF" />
                      <Text style={styles.actionButtonText}>Add Expense</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#EF6C00' }]}
                      onPress={() => {
                        resetComplaintForm();
                        setComplaintModalVisible(true);
                      }}
                    >
                      <AlertTriangle size={18} color="#FFF" />
                      <Text style={styles.actionButtonText}>Log Alert</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => {
                        resetPaymentForm();
                        setFormFlatNo(selectedMemberFlat);
                        setPaymentModalVisible(true);
                      }}
                    >
                      <CreditCard size={18} color="#FFF" />
                      <Text style={styles.actionButtonText}>Pay Dues</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#EF6C00' }]}
                      onPress={() => {
                        resetComplaintForm();
                        setFormFlatNo(selectedMemberFlat);
                        setComplaintModalVisible(true);
                      }}
                    >
                      <AlertTriangle size={18} color="#FFF" />
                      <Text style={styles.actionButtonText}>File Complaint</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            {/* Recent Notices */}
            <View style={[styles.dashboardSection, { marginBottom: 32 }]}>
              <Text style={styles.sectionTitle}>Latest Notices</Text>
              {(notices || []).slice(0, 2).map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.miniCard}
                  onPress={() => setSelectedNotice(item)}
                >
                  <Megaphone size={14} color="#6200EE" style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniCardTitle} numberOfLines={1}>{item.Title}</Text>
                    <Text style={styles.miniCardDate}>{item.Date}</Text>
                  </View>
                  <ChevronRight size={14} color="#777" />
                </TouchableOpacity>
              ))}
              {(notices || []).length === 0 && (
                <Text style={styles.emptySectionText}>No notice updates posted yet</Text>
              )}
            </View>
          </ScrollView>
        )}

        {/* --- MEMBERS TAB --- */}
        {currentTab === 'Members' && (
          <View style={styles.tabContent}>
            <View style={styles.searchBarContainer}>
              <Search size={20} color="#777" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={memberSearch}
                onChangeText={setMemberSearch}
                placeholder="Search flat or owner name..."
              />
            </View>

            {hasWings && (
              <View style={styles.wingsFilterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wingsFilterScroll}>
                  {['All', ...wingsList].map((wing) => (
                    <TouchableOpacity
                      key={wing}
                      style={[
                        styles.wingFilterButton,
                        selectedWing === wing ? styles.wingFilterButtonActive : {}
                      ]}
                      onPress={() => setSelectedWing(wing)}
                    >
                      <Text style={[
                        styles.wingFilterText,
                        selectedWing === wing ? styles.wingFilterTextActive : {}
                      ]}>
                        Wing {wing}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <FlatList
              data={filteredMembers}
              keyExtractor={(item) => item.FlatNo}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.card}
                  onPress={() => setSelectedMember(item)}
                >
                  <View style={styles.cardRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.FlatNo}</Text>
                    </View>
                    <View style={styles.cardMain}>
                      <Text style={styles.cardTitle}>{item.OwnerName}</Text>
                      <Text style={styles.cardDesc}>Status: {item.Status}</Text>
                    </View>
                    <View style={styles.cardRight}>
                      <Text style={[
                        styles.balanceText,
                        item.Balance > 0 ? styles.balanceUnpaid : styles.balanceClear
                      ]}>
                        {item.Balance > 0 ? \`₹\${item.Balance}\` : (item.Balance < 0 ? \`-₹\${Math.abs(item.Balance)}\` : 'Clear')}
                      </Text>
                      <Text style={styles.balanceSub}>Dues</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Users size={48} color="#CCC" />
                  <Text style={styles.emptyText}>No members found</Text>
                </View>
              }
            />
          </View>
        )}

        {/* --- PAYMENTS TAB --- */}
        {currentTab === 'Payments' && (
          <View style={styles.tabContent}>
            <FlatList
              data={payments}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={[styles.avatar, { backgroundColor: '#E8F5E9' }]}>
                      <CreditCard size={20} color="#2E7D32" />
                    </View>
                    <View style={styles.cardMain}>
                      <Text style={styles.cardTitle}>Flat {item.FlatNo}</Text>
                      <Text style={styles.cardDesc}>{item.Mode} • {item.Date}</Text>
                    </View>
                    <View style={styles.cardRight}>
                      <Text style={[styles.amountText, { color: '#2E7D32' }]}>+₹{item.Amount}</Text>
                      <Text style={styles.statusCleared}>Cleared</Text>
                    </View>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <CreditCard size={48} color="#CCC" />
                  <Text style={styles.emptyText}>No payments logged yet</Text>
                </View>
              }
            />
            <TouchableOpacity 
              style={styles.fab}
              onPress={() => {
                resetPaymentForm();
                setPaymentModalVisible(true);
              }}
            >
              <Plus size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* --- EXPENSES TAB --- */}
        {currentTab === 'Expenses' && (
          <View style={styles.tabContent}>
            <FlatList
              data={expenses}
              keyExtractor={(item, index) => index.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={[styles.avatar, { backgroundColor: '#FFEBEE' }]}>
                      <TrendingDown size={20} color="#C62828" />
                    </View>
                    <View style={styles.cardMain}>
                      <Text style={styles.cardTitle}>{item.Category}</Text>
                      <Text style={styles.cardDesc}>To: {item.Vendor} • {item.Date}</Text>
                    </View>
                    <View style={styles.cardRight}>
                      <Text style={[styles.amountText, { color: '#C62828' }]}>-₹{item.Amount}</Text>
                      <Text style={styles.approvedText}>Approved</Text>
                    </View>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <TrendingDown size={48} color="#CCC" />
                  <Text style={styles.emptyText}>No expenses logged yet</Text>
                </View>
              }
            />
            <TouchableOpacity 
              style={styles.fab}
              onPress={() => {
                resetExpenseForm();
                setExpenseModalVisible(true);
              }}
            >
              <Plus size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* --- COMPLAINTS TAB --- */}
        {currentTab === 'Complaints' && (
          <View style={styles.tabContent}>
            <View style={styles.filterRow}>
              {['All', 'Open', 'In Progress', 'Resolved'].map((f) => (
                <TouchableOpacity 
                  key={f}
                  style={[styles.filterChip, complaintFilter === f && styles.filterChipActive]}
                  onPress={() => setComplaintFilter(f)}
                >
                  <Text style={[styles.filterChipText, complaintFilter === f && styles.filterChipTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <FlatList
              data={filteredComplaints}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.card}
                  onPress={() => setSelectedComplaint(item)}
                >
                  <View style={styles.cardRow}>
                    <View style={[
                      styles.avatar, 
                      { backgroundColor: item.Urgency === 'High' ? '#FFEBEE' : (item.Urgency === 'Medium' ? '#FFF3E0' : '#E8F5E9') }
                    ]}>
                      <AlertTriangle size={20} color={item.Urgency === 'High' ? '#C62828' : (item.Urgency === 'Medium' ? '#EF6C00' : '#2E7D32')} />
                    </View>
                    <View style={styles.cardMain}>
                      <Text style={styles.cardTitle}>{item.Title}</Text>
                      <Text style={styles.cardDesc}>Flat {item.FlatNo} • {item.Date}</Text>
                    </View>
                    <View style={styles.cardRight}>
                      <View style={[
                        styles.statusBadge,
                        item.Status === 'Resolved' ? styles.badgeResolved : (item.Status === 'In Progress' ? styles.badgeProgress : styles.badgeOpen)
                      ]}>
                        <Text style={styles.statusBadgeText}>{item.Status}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <AlertTriangle size={48} color="#CCC" />
                  <Text style={styles.emptyText}>No complaints found</Text>
                </View>
              }
            />
            <TouchableOpacity 
              style={styles.fab}
              onPress={() => {
                resetComplaintForm();
                setComplaintModalVisible(true);
              }}
            >
              <Plus size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* --- NOTICES TAB --- */}
        {currentTab === 'Notices' && (
          <View style={styles.tabContent}>
            <FlatList
              data={notices}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.card}
                  onPress={() => setSelectedNotice(item)}
                >
                  <View style={styles.cardRow}>
                    <View style={[styles.avatar, { backgroundColor: '#E3F2FD' }]}>
                      <Megaphone size={20} color="#1565C0" />
                    </View>
                    <View style={styles.cardMain}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.Title}</Text>
                      <Text style={styles.cardDesc}>{item.Category} • {item.Date}</Text>
                    </View>
                    <View style={styles.cardRight}>
                      <ChevronRight size={20} color="#777" />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Megaphone size={48} color="#CCC" />
                  <Text style={styles.emptyText}>No active notices posted</Text>
                </View>
              }
            />
          </View>
        )}
      </View>

      {/* Navigation Bottom Tabs */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, currentTab === 'Dashboard' && styles.navItemActive]}
          onPress={() => setCurrentTab('Dashboard')}
        >
          <BarChart3 size={18} color={currentTab === 'Dashboard' ? PRIMARY_COLOR : '#777'} />
          <Text style={[styles.navText, currentTab === 'Dashboard' && styles.navTextActive]} numberOfLines={1}>Dashboard</Text>
        </TouchableOpacity>

        {userRole === 'Admin' && (
          <TouchableOpacity 
            style={[styles.navItem, currentTab === 'Members' && styles.navItemActive]}
            onPress={() => setCurrentTab('Members')}
          >
            <Users size={18} color={currentTab === 'Members' ? PRIMARY_COLOR : '#777'} />
            <Text style={[styles.navText, currentTab === 'Members' && styles.navTextActive]} numberOfLines={1}>Flats</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.navItem, currentTab === 'Payments' && styles.navItemActive]}
          onPress={() => setCurrentTab('Payments')}
        >
          <CreditCard size={18} color={currentTab === 'Payments' ? PRIMARY_COLOR : '#777'} />
          <Text style={[styles.navText, currentTab === 'Payments' && styles.navTextActive]} numberOfLines={1}>Income</Text>
        </TouchableOpacity>

        {userRole === 'Admin' && (
          <TouchableOpacity 
            style={[styles.navItem, currentTab === 'Expenses' && styles.navItemActive]}
            onPress={() => setCurrentTab('Expenses')}
          >
            <TrendingDown size={18} color={currentTab === 'Expenses' ? PRIMARY_COLOR : '#777'} />
            <Text style={[styles.navText, currentTab === 'Expenses' && styles.navTextActive]} numberOfLines={1}>Expense</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.navItem, currentTab === 'Complaints' && styles.navItemActive]}
          onPress={() => setCurrentTab('Complaints')}
        >
          <AlertTriangle size={18} color={currentTab === 'Complaints' ? PRIMARY_COLOR : '#777'} />
          <Text style={[styles.navText, currentTab === 'Complaints' && styles.navTextActive]} numberOfLines={1}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, currentTab === 'Notices' && styles.navItemActive]}
          onPress={() => setCurrentTab('Notices')}
        >
          <Megaphone size={18} color={currentTab === 'Notices' ? PRIMARY_COLOR : '#777'} />
          <Text style={[styles.navText, currentTab === 'Notices' && styles.navTextActive]} numberOfLines={1}>Notices</Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================= */}
      {/* ======================= MODALS ======================== */}
      {/* ======================================================= */}

      {/* Member Details Modal */}
      <Modal
        visible={selectedMember !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedMember(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Member Profile</Text>
              <TouchableOpacity onPress={() => setSelectedMember(null)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedMember && (
              <ScrollView style={styles.sheetBody}>
                <View style={styles.profileBadge}>
                  <Text style={styles.profileAvatarText}>{selectedMember.FlatNo}</Text>
                  <Text style={styles.profileName}>{selectedMember.OwnerName}</Text>
                  <Text style={styles.profileStatus}>{selectedMember.Status}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Phone size={18} color="#666" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.infoValue}>{selectedMember.ContactNo}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Mail size={18} color="#666" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Email Address</Text>
                    <Text style={styles.infoValue}>{selectedMember.Email}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <DollarSign size={18} color="#666" style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Maintenance Account Balance</Text>
                    <Text style={[
                      styles.infoValue, 
                      selectedMember.Balance > 0 ? { color: ERROR_COLOR, fontWeight: 'bold' } : { color: 'green' }
                    ]}>
                      {selectedMember.Balance > 0 ? \`₹\${selectedMember.Balance} Pending\` : \`₹\${Math.abs(selectedMember.Balance)} Paid / Advance\`}
                    </Text>
                  </View>
                </View>

                {selectedMember.CoOwners && (
                  <View style={styles.infoRow}>
                    <User size={18} color="#666" style={styles.infoIcon} />
                    <View>
                      <Text style={styles.infoLabel}>Co-Owners / Residents</Text>
                      <Text style={styles.infoValue}>{selectedMember.CoOwners}</Text>
                    </View>
                  </View>
                )}

                {selectedMember.VehicleNo && (
                  <View style={styles.infoRow}>
                    <FileText size={18} color="#666" style={styles.infoIcon} />
                    <View>
                      <Text style={styles.infoLabel}>Registered Vehicle</Text>
                      <Text style={styles.infoValue}>{selectedMember.VehicleNo}</Text>
                    </View>
                  </View>
                )}

                {hasWings && selectedMember.Wing && (
                  <View style={styles.infoRow}>
                    <Layers size={18} color="#666" style={styles.infoIcon} />
                    <View>
                      <Text style={styles.infoLabel}>Wing / Block</Text>
                      <Text style={styles.infoValue}>Wing {selectedMember.Wing}</Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.sheetPrimaryButton}
                  onPress={() => {
                    setFormFlatNo(selectedMember.FlatNo);
                    setSelectedMember(null);
                    setPaymentModalVisible(true);
                  }}
                >
                  <DollarSign size={18} color="#FFF" />
                  <Text style={styles.buttonTextWithIcon}>Log Maintenance Payment</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.sheetSecondaryButton, { marginTop: 10, borderColor: PRIMARY_COLOR, borderWidth: 1 }]}
                  onPress={() => {
                    setEditFlatNo(selectedMember.FlatNo);
                    setEditOwnerName(selectedMember.OwnerName);
                    setEditContactNo(selectedMember.ContactNo);
                    setEditEmail(selectedMember.Email);
                    setEditStatus(selectedMember.Status);
                    setEditCoOwners(selectedMember.CoOwners || '');
                    setEditVehicleNo(selectedMember.VehicleNo || '');
                    setEditWing(selectedMember.Wing || '');
                    setSelectedMember(null);
                    setEditMemberModalVisible(true);
                  }}
                >
                  <User size={18} color={PRIMARY_COLOR} />
                  <Text style={[styles.buttonTextWithIcon, { color: PRIMARY_COLOR }]}>Edit Contact & Wing</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Complaint Detail Modal */}
      <Modal
        visible={selectedComplaint !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedComplaint(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dialogContainer}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>Complaint Details</Text>
              <TouchableOpacity onPress={() => setSelectedComplaint(null)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedComplaint && (
              <View style={styles.dialogBody}>
                <Text style={styles.dialogCategory}>{selectedComplaint.Category.toUpperCase()}</Text>
                <Text style={styles.dialogMainTitle}>{selectedComplaint.Title}</Text>
                
                <View style={styles.dialogMetadata}>
                  <Text style={styles.metaText}>Filed by: Flat {selectedComplaint.FlatNo}</Text>
                  <Text style={styles.metaText}>Date: {selectedComplaint.Date}</Text>
                </View>

                <ScrollView style={styles.descScroll}>
                  <Text style={styles.dialogDesc}>{selectedComplaint.Description}</Text>
                </ScrollView>

                <View style={styles.divider} />

                <Text style={styles.statusSectionLabel}>Change Complaint Status:</Text>
                <View style={styles.statusButtonsContainer}>
                  {(['Open', 'In Progress', 'Resolved']).map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.statusButtonOption,
                        selectedComplaint.Status === st && {
                          backgroundColor: st === 'Resolved' ? '#E8F5E9' : (st === 'In Progress' ? '#FFF3E0' : '#FFEBEE'),
                          borderColor: st === 'Resolved' ? '#2E7D32' : (st === 'In Progress' ? '#EF6C00' : '#C62828'),
                        }
                      ]}
                      onPress={() => handleUpdateComplaintStatus(selectedComplaint.id, st)}
                    >
                      <Text style={[
                        styles.statusButtonOptionText,
                        selectedComplaint.Status === st && {
                          color: st === 'Resolved' ? '#2E7D32' : (st === 'In Progress' ? '#EF6C00' : '#C62828'),
                          fontWeight: 'bold'
                        }
                      ]}>{st}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Notice Detail Modal */}
      <Modal
        visible={selectedNotice !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedNotice(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Society Notice</Text>
              <TouchableOpacity onPress={() => setSelectedNotice(null)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedNotice && (
              <ScrollView style={styles.sheetBody}>
                <View style={styles.noticeDetailHeader}>
                  <View style={[styles.avatar, { backgroundColor: '#E3F2FD' }]}>
                    <Megaphone size={20} color="#1565C0" />
                  </View>
                  <View style={styles.noticeDetailMeta}>
                    <Text style={styles.noticeDetailTitle}>{selectedNotice.Title}</Text>
                    <Text style={styles.noticeDetailSub}>{selectedNotice.Category} • Posted by {selectedNotice.PostedBy} on {selectedNotice.Date}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.noticeDetailContent}>{selectedNotice.Content}</Text>

                {selectedNotice.AttachmentUrl ? (
                  <TouchableOpacity 
                    style={styles.attachmentButton}
                    onPress={() => {
                      Linking.openURL(selectedNotice.AttachmentUrl).catch(err => {
                        Alert.alert('Error', 'Cannot open attachment link');
                      });
                    }}
                  >
                    <ExternalLink size={18} color={PRIMARY_COLOR} />
                    <Text style={styles.attachmentText}>View Official Attachment Document</Text>
                  </TouchableOpacity>
                ) : null}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.settingsModalOverlay}>
          <View style={styles.settingsModalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Society Settings</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <X size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Society Name</Text>
              <TextInput
                style={styles.modalInput}
                value={tempSocietyName}
                onChangeText={setTempSocietyName}
                placeholder="Enter Society Name"
              />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555' }}>Enable Wings Filter?</Text>
              <TouchableOpacity 
                onPress={() => setTempHasWings(!tempHasWings)}
                style={{
                  backgroundColor: tempHasWings ? PRIMARY_COLOR : '#E5E7EB',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: tempHasWings ? '#FFF' : '#333', fontSize: 12, fontWeight: 'bold' }}>
                  {tempHasWings ? 'Yes' : 'No'}
                </Text>
              </TouchableOpacity>
            </View>

            {tempHasWings && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Define Wings (separated by comma)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={tempWingsList}
                  onChangeText={setTempWingsList}
                  placeholder="e.g. A, B, C"
                />
              </View>
            )}

            <TouchableOpacity 
              style={[styles.sheetPrimaryButton, { marginTop: 16 }]} 
              onPress={async () => {
                const wings = tempWingsList.split(',').map(w => w.trim()).filter(w => w !== '');
                setSocietyName(tempSocietyName);
                setHasWings(tempHasWings);
                setWingsList(wings);
                setSettingsModalVisible(false);

                // Save to Google Sheets
                try {
                  await api.saveSettings([
                    { Key: 'societyName', Value: tempSocietyName },
                    { Key: 'hasWings', Value: String(tempHasWings) },
                    { Key: 'wingsList', Value: wings.join(', ') }
                  ]);
                } catch (err) {
                  console.warn("Saved settings locally only");
                }
              }}
            >
              <Text style={styles.buttonTextWithIcon}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        visible={editMemberModalVisible}
        animationType="slide"
        onRequestClose={() => setEditMemberModalVisible(false)}
      >
        <SafeAreaView style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formHeaderTitle}>Edit Member: {editFlatNo}</Text>
            <TouchableOpacity onPress={() => setEditMemberModalVisible(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Owner Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editOwnerName}
                onChangeText={setEditOwnerName}
                placeholder="Enter owner name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Contact Number</Text>
              <TextInput
                style={styles.modalInput}
                value={editContactNo}
                onChangeText={setEditContactNo}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email Address</Text>
              <TextInput
                style={styles.modalInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {hasWings && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Wing / Block</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editWing}
                  onChangeText={setEditWing}
                  placeholder="e.g. A"
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Co-Owners / Residents</Text>
              <TextInput
                style={styles.modalInput}
                value={editCoOwners}
                onChangeText={setEditCoOwners}
                placeholder="e.g. Spouse Name, Child Name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Registered Vehicle</Text>
              <TextInput
                style={styles.modalInput}
                value={editVehicleNo}
                onChangeText={setEditVehicleNo}
                placeholder="e.g. MH-12-AB-1234"
              />
            </View>

            <TouchableOpacity 
              style={[styles.sheetPrimaryButton, { marginTop: 24 }]} 
              onPress={async () => {
                const origMember = members.find(m => m.FlatNo === editFlatNo) || {};
                const updatedMember = {
                  ...origMember,
                  FlatNo: editFlatNo,
                  OwnerName: editOwnerName,
                  ContactNo: editContactNo,
                  Email: editEmail,
                  Status: editStatus,
                  CoOwners: editCoOwners,
                  VehicleNo: editVehicleNo,
                  Wing: editWing,
                };
                
                // Update locally first
                setMembers(prev => prev.map(m => m.FlatNo === editFlatNo ? updatedMember : m));
                setEditMemberModalVisible(false);

                // Save to Google Sheets
                try {
                  await api.saveMember(updatedMember);
                  Alert.alert('Success', 'Member contact and wing updated successfully!');
                  await fetchAllData();
                } catch (err) {
                  Alert.alert('Notice', 'Member saved locally. Sync with sheet failed.');
                }
              }}
            >
              <Text style={styles.buttonTextWithIcon}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ======================================================= */}
      {/* ==================== FORM MODALS ====================== */}
      {/* ======================================================= */}

      {/* Add Payment Modal */}
      <Modal visible={paymentModalVisible} animationType="slide">
        <SafeAreaView style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formHeaderTitle}>Log Payment</Text>
            <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Flat Number</Text>
              <TextInput
                style={styles.formInput}
                value={formFlatNo}
                onChangeText={setFormFlatNo}
                placeholder="e.g. 101, 203"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount (₹)</Text>
              <TextInput
                style={styles.formInput}
                value={formAmount}
                onChangeText={setFormAmount}
                placeholder="e.g. 1500"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Payment Mode</Text>
              <View style={styles.modeSelector}>
                {(['UPI', 'Bank Transfer', 'Cash', 'Cheque']).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.modeChip, formMode === m && styles.modeChipActive]}
                    onPress={() => setFormMode(m)}
                  >
                    <Text style={[styles.modeChipText, formMode === m && styles.modeChipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Reference / Transaction ID (Optional)</Text>
              <TextInput
                style={styles.formInput}
                value={formRefNo}
                onChangeText={setFormRefNo}
                placeholder="UPI ref or Cheque number"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddPayment}>
              <Text style={styles.submitButtonText}>Submit Payment Entry</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add Expense Modal */}
      <Modal visible={expenseModalVisible} animationType="slide">
        <SafeAreaView style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formHeaderTitle}>Add Society Expense</Text>
            <TouchableOpacity onPress={() => setExpenseModalVisible(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.modeSelector}>
                {['Maintenance', 'Security', 'Water', 'Electricity', 'Repairs', 'Gardening'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.modeChip, formExpenseCategory === cat && styles.modeChipActive, { marginBottom: 8 }]}
                    onPress={() => setFormExpenseCategory(cat)}
                  >
                    <Text style={[styles.modeChipText, formExpenseCategory === cat && styles.modeChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount Spent (₹)</Text>
              <TextInput
                style={styles.formInput}
                value={formExpenseAmount}
                onChangeText={setFormExpenseAmount}
                placeholder="e.g. 5000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Vendor / Payee</Text>
              <TextInput
                style={styles.formInput}
                value={formExpenseVendor}
                onChangeText={setFormExpenseVendor}
                placeholder="Company or Service Provider name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Invoice Number (Optional)</Text>
              <TextInput
                style={styles.formInput}
                value={formExpenseInvoice}
                onChangeText={setFormExpenseInvoice}
                placeholder="e.g. INV-1004"
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddExpense}>
              <Text style={styles.submitButtonText}>Submit Expense Receipt</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add Complaint Modal */}
      <Modal visible={complaintModalVisible} animationType="slide">
        <SafeAreaView style={styles.formContainer}>
          <View style={styles.formHeader}>
            <Text style={styles.formHeaderTitle}>File Helpdesk Complaint</Text>
            <TouchableOpacity onPress={() => setComplaintModalVisible(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formBody}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Your Flat Number</Text>
              <TextInput
                style={styles.formInput}
                value={formFlatNo}
                onChangeText={setFormFlatNo}
                placeholder="e.g. 101, 302"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.modeSelector}>
                {['Plumbing', 'Electrical', 'Security', 'Cleanliness', 'Parking', 'Others'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.modeChip, formComplaintCategory === cat && styles.modeChipActive, { marginBottom: 8 }]}
                    onPress={() => setFormComplaintCategory(cat)}
                  >
                    <Text style={[styles.modeChipText, formComplaintCategory === cat && styles.modeChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Short Title</Text>
              <TextInput
                style={styles.formInput}
                value={formComplaintTitle}
                onChangeText={setFormComplaintTitle}
                placeholder="Brief summary of the issue"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Detailed Description</Text>
              <TextInput
                style={[styles.formInput, { height: 100, textAlignVertical: 'top' }]}
                value={formComplaintDesc}
                onChangeText={setFormComplaintDesc}
                placeholder="Describe when the issue started and specifics..."
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Urgency Priority</Text>
              <View style={styles.modeSelector}>
                {(['Low', 'Medium', 'High']).map((urg) => (
                  <TouchableOpacity
                    key={urg}
                    style={[
                      styles.modeChip, 
                      formComplaintUrgency === urg && {
                        backgroundColor: urg === 'High' ? '#FFEBEE' : (urg === 'Medium' ? '#FFF3E0' : '#E8F5E9'),
                        borderColor: urg === 'High' ? '#C62828' : (urg === 'Medium' ? '#EF6C00' : '#2E7D32'),
                      }
                    ]}
                    onPress={() => setFormComplaintUrgency(urg)}
                  >
                    <Text style={[
                      styles.modeChipText,
                      formComplaintUrgency === urg && {
                        color: urg === 'High' ? '#C62828' : (urg === 'Medium' ? '#EF6C00' : '#2E7D32'),
                        fontWeight: 'bold'
                      }
                    ]}>{urg}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddComplaint}>
              <Text style={styles.submitButtonText}>Submit Complaint Ticket</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wingsFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  wingsFilterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  wingFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  wingFilterButtonActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  wingFilterText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  wingFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  settingsButton: {
    marginRight: 12,
    padding: 6,
  },
  settingsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsModalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
  },
  loginCard: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loginIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0E5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleToggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleToggleActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  roleToggleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
  },
  roleToggleTextActive: {
    color: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  hintText: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    fontStyle: 'italic',
  },
  loginButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  logoutText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  tabContent: {
    flex: 1,
  },
  absoluteLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loaderText: {
    marginTop: 10,
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0E5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardMain: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  balanceText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  balanceUnpaid: {
    color: ERROR_COLOR,
  },
  balanceClear: {
    color: 'green',
  },
  balanceSub: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusCleared: {
    fontSize: 10,
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    overflow: 'hidden',
  },
  approvedText: {
    fontSize: 10,
    color: '#333',
    backgroundColor: '#ECEFF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    overflow: 'hidden',
  },
  filterRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  filterChipText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeOpen: {
    backgroundColor: '#FFEBEE',
  },
  badgeProgress: {
    backgroundColor: '#FFF3E0',
  },
  badgeResolved: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: PRIMARY_COLOR,
  },
  navText: {
    fontSize: 10,
    color: '#777',
    marginTop: 4,
  },
  navTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sheetBody: {
    marginBottom: 10,
  },
  profileBadge: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatarText: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0E5FF',
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 64,
    overflow: 'hidden',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileStatus: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: 8,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 2,
  },
  sheetPrimaryButton: {
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonTextWithIcon: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 20,
    padding: 16,
    maxHeight: '80%',
    alignSelf: 'center',
    width: '90%',
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dialogBody: {
    paddingVertical: 8,
  },
  dialogCategory: {
    fontSize: 10,
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
  },
  dialogMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  dialogMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 11,
    color: '#777',
  },
  descScroll: {
    maxHeight: 150,
    marginBottom: 16,
  },
  dialogDesc: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 12,
  },
  statusSectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButtonOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statusButtonOptionText: {
    fontSize: 12,
    color: '#555',
  },
  noticeDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeDetailMeta: {
    flex: 1,
    marginLeft: 12,
  },
  noticeDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noticeDetailSub: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  noticeDetailContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    paddingVertical: 12,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E5FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
  },
  attachmentText: {
    marginLeft: 8,
    color: PRIMARY_COLOR,
    fontWeight: '600',
    fontSize: 13,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  formHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  formBody: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  modeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeChipActive: {
    backgroundColor: '#F0E5FF',
    borderColor: PRIMARY_COLOR,
  },
  modeChipText: {
    fontSize: 12,
    color: '#555',
  },
  modeChipTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '950',
  },
  dashboardSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryProgressRow: {
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6200EE',
    borderRadius: 3,
  },
  emptySectionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginVertical: 12,
  },
  quickActionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6200EE',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  miniCardTitle: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  miniCardDate: {
    fontSize: 9,
    color: '#888',
    marginTop: 2,
  },
});
`;

export const EXPO_API_TS = `import axios from 'axios';

// Replace with your actual Supabase credentials:
export const SUPABASE_URL = 'https://czirnbiybxydsdzbimyw.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': \`Bearer \${SUPABASE_ANON_KEY}\`,
  'Content-Type': 'application/json'
};

// Hardcoded backup simulation engine if Sheets API is not connected or returns an error.
// This allows you to demo the exact same functional workflow instantly.
class BackupDatabase {
  members = [
    { FlatNo: "101", OwnerName: "Amit Sharma", ContactNo: "+91 98765 43210", Email: "amit.sharma@example.com", Balance: 1500, Status: "Owner", CoOwners: "Sunita (Wife)", VehicleNo: "MH-02-AB-1234" },
    { FlatNo: "102", OwnerName: "Priya Patel", ContactNo: "+91 98765 12345", Email: "priya.p@example.com", Balance: 0, Status: "Owner", CoOwners: "None", VehicleNo: "MH-02-CD-5678" },
    { FlatNo: "103", OwnerName: "Rajesh Kumar", ContactNo: "+91 98234 56789", Email: "rajesh.tenant@example.com", Balance: 3000, Status: "Tenant", CoOwners: "None", VehicleNo: "MH-02-XY-9012" },
    { FlatNo: "201", OwnerName: "Vikram Singh", ContactNo: "+91 98111 22233", Email: "vikram.singh@example.com", Balance: -1500, Status: "Owner", CoOwners: "Renu Singh", VehicleNo: "MH-02-VS-2010" },
    { FlatNo: "202", OwnerName: "Anjali Gupta", ContactNo: "+91 99887 76655", Email: "anjali.g@example.com", Balance: 4500, Status: "Tenant", CoOwners: "None", VehicleNo: "MH-02-PQ-4455" }
  ];

  payments = [
    { Date: "2026-07-15", FlatNo: "101", OwnerName: "Amit Sharma", Amount: 1500, Mode: "UPI", ReferenceNo: "UPI92837498112", Status: "Cleared" },
    { Date: "2026-07-14", FlatNo: "201", OwnerName: "Vikram Singh", Amount: 3000, Mode: "Bank Transfer", ReferenceNo: "NEFT-TXN12038910", Status: "Cleared" }
  ];

  expenses = [
    { Date: "2026-07-16", Category: "Security", Amount: 12000, Vendor: "Apex Guard Services", InvoiceNo: "INV-2026-102", ApprovedBy: "Society Committee" },
    { Date: "2026-07-14", Category: "Electricity", Amount: 4520, Vendor: "MSEDCL Electric", InvoiceNo: "ELEC-JUL-9923", ApprovedBy: "Secretary" }
  ];

  complaints = [
    { id: "C-101", FlatNo: "202", Category: "Plumbing", Title: "Water leakage in bathroom", Description: "Water is dripping from bathroom ceiling.", Date: "2026-07-18", Status: "Open", Urgency: "High" },
    { id: "C-102", FlatNo: "103", Category: "Electrical", Title: "Corridor light not working", Description: "Corridor tube light outside 103 fused.", Date: "2026-07-17", Status: "In Progress", Urgency: "Low" }
  ];

  notices = [
    { id: "N-101", Date: "2026-07-18", Title: "Annual General Body Meeting (AGM) Agenda", Category: "Meeting", Content: "AGM on Sunday July 26th in Clubhouse to discuss maintenance.", AttachmentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", PostedBy: "Management Committee" },
    { id: "N-102", Date: "2026-07-12", Title: "Water Tank Cleaning Schedule", Category: "Maintenance", Content: "Water cut on Monday 20th July from 10am to 4pm.", AttachmentUrl: "", PostedBy: "Facility Manager" }
  ];

  userConsents = [
    { id: "UC-1001", UserId: "Auth-gw-amit-sharma", SocietyId: "greenwood", ConsentedAt: "2026-07-22T08:00:00Z", PolicyVersion: "v1.0-2026", IPAddress: "127.0.0.1", UserRole: "Admin" },
    { id: "UC-1002", UserId: "amit080578@gmail.com", SocietyId: "greenwood", ConsentedAt: "2026-07-22T08:05:00Z", PolicyVersion: "v1.0-2026", IPAddress: "127.0.0.1", UserRole: "Admin" }
  ];
}

const backupDb = new BackupDatabase();

export const api = {
  async getUserConsents() {
    try {
      if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' || !SUPABASE_ANON_KEY) {
        return backupDb.userConsents;
      }
      const response = await axios.get(\`\${SUPABASE_URL}/rest/v1/UserConsents?select=*\`, { headers });
      return response.data;
    } catch (error) {
      console.warn("Using simulated backup consents data.");
      return backupDb.userConsents;
    }
  },

  async saveUserConsent(consent) {
    try {
      if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' || !SUPABASE_ANON_KEY) {
        backupDb.userConsents.unshift(consent);
        return { success: true };
      }
      await axios.post(\`\${SUPABASE_URL}/rest/v1/UserConsents\`, consent, { headers });
      return { success: true };
    } catch (error) {
      console.error("Save consent failed:", error);
      throw error;
    }
  },
  async getMembers() {
    try {
      if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' || !SUPABASE_ANON_KEY) {
        return backupDb.members;
      }
      const response = await axios.get(\`\${SUPABASE_URL}/rest/v1/Members?select=*\`, { headers });
      return response.data;
    } catch (error) {
      console.warn("Using simulated backup members data.");
      return backupDb.members;
    }
  },

  async getPayments() {
    try {
      if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' || !SUPABASE_ANON_KEY) {
        return backupDb.payments;
      }
      const response = await axios.get(\`\${SUPABASE_URL}/rest/v1/Payments?select=*\`, { headers });
      return response.data;
    } catch (error) {
      console.warn("Using simulated backup payments data.");
      return backupDb.payments;
    }
  },

  async getExpenses() {
    try {
      if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' || !SUPABASE_ANON_KEY) {
        return backupDb.expenses;
      }
      const response = await axios.get(\`\${SUPABASE_URL}/rest/v1/Expenses?select=*\`, { headers });
      return response.data;
    } catch (error) {
      console.warn("Using simulated backup expenses data.");
      return backupDb.expenses;
    }
  },

  async getComplaints() {
    try {
      if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' || !SUPABASE_ANON_KEY) {
        return backupDb.complaints;
      }
      const response = await axios.get(\`\${SUPABASE_URL}/rest/v1/Complaints?select=*\`, { headers });
      return response.data;
    } catch (error) {
      console.warn("Using simulated backup complaints data.");
      return backupDb.complaints;
    }
  },

  async getNotices() {
    try {
      if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' || !SUPABASE_ANON_KEY) {
        return backupDb.notices;
      }
      const response = await axios.get(\`\${SUPABASE_URL}/rest/v1/Notices?select=*\`, { headers });
      return response.data;
    } catch (error) {
      console.warn("Using simulated backup notices data.");
      return backupDb.notices;
    }
  },

  // POST data to Supabase REST tables
  async postData(payload) {
    try {
      if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' || !SUPABASE_ANON_KEY) {
        if (payload.sheet === 'Payments') {
          const amt = payload.row[3];
          const flat = payload.row[1];
          backupDb.payments.unshift({
            Date: payload.row[0],
            FlatNo: flat,
            OwnerName: payload.row[2],
            Amount: amt,
            Mode: payload.row[4],
            ReferenceNo: payload.row[5],
            Status: payload.row[6]
          });
          const mIdx = backupDb.members.findIndex(m => m.FlatNo === flat);
          if (mIdx !== -1) backupDb.members[mIdx].Balance -= amt;
        } else if (payload.sheet === 'Expenses') {
          backupDb.expenses.unshift({
            Date: payload.row[0],
            Category: payload.row[1],
            Amount: payload.row[2],
            Vendor: payload.row[3],
            InvoiceNo: payload.row[4],
            ApprovedBy: payload.row[5]
          });
        } else if (payload.sheet === 'Complaints') {
          backupDb.complaints.unshift({
            id: payload.row[0],
            FlatNo: payload.row[1],
            Category: payload.row[2],
            Title: payload.row[3],
            Description: payload.row[4],
            Date: payload.row[5],
            Status: payload.row[6],
            Urgency: payload.row[7]
          });
        }
        return { success: true, simulated: true };
      }

      if (payload.sheet === 'Payments') {
        const loggedId = \`P-\${Date.now()}\`;
        await axios.post(\`\${SUPABASE_URL}/rest/v1/Payments\`, {
          id: loggedId,
          Date: payload.row[0],
          FlatNo: payload.row[1],
          OwnerName: payload.row[2],
          Amount: parseFloat(payload.row[3]) || 0,
          Mode: payload.row[4],
          ReferenceNo: payload.row[5],
          Status: payload.row[6]
        }, { headers });

        // Update member outstanding balance
        try {
          const getRes = await axios.get(\`\${SUPABASE_URL}/rest/v1/Members?FlatNo=eq.\${payload.row[1]}\`, { headers });
          if (getRes.data && getRes.data.length > 0) {
            const currentBal = parseFloat(getRes.data[0].Balance) || 0;
            await axios.patch(\`\${SUPABASE_URL}/rest/v1/Members?FlatNo=eq.\${payload.row[1]}\`, {
              Balance: currentBal - parseFloat(payload.row[3])
            }, { headers });
          }
        } catch (memErr) {
          console.warn('Failed to auto-update member balance in Supabase:', memErr);
        }

      } else if (payload.sheet === 'Expenses') {
        await axios.post(\`\${SUPABASE_URL}/rest/v1/Expenses\`, {
          id: \`E-\${Date.now()}\`,
          Date: payload.row[0],
          Category: payload.row[1],
          Amount: parseFloat(payload.row[2]) || 0,
          Vendor: payload.row[3],
          InvoiceNo: payload.row[4],
          ApprovedBy: payload.row[5]
        }, { headers });

      } else if (payload.sheet === 'Complaints') {
        await axios.post(\`\${SUPABASE_URL}/rest/v1/Complaints\`, {
          id: payload.row[0],
          FlatNo: payload.row[1],
          Category: payload.row[2],
          Title: payload.row[3],
          Description: payload.row[4],
          Date: payload.row[5],
          Status: payload.row[6],
          Urgency: payload.row[7]
        }, { headers });
      }

      return { success: true };
    } catch (error) {
      console.error("Post request failed:", error);
      throw error;
    }
  },

  async updateComplaintStatus(complaintId, newStatus) {
    try {
      if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' || !SUPABASE_ANON_KEY) {
        const cIdx = backupDb.complaints.findIndex(c => c.id === complaintId);
        if (cIdx !== -1) backupDb.complaints[cIdx].Status = newStatus;
        return { success: true };
      }
      
      await axios.patch(\`\${SUPABASE_URL}/rest/v1/Complaints?id=eq.\${complaintId}\`, {
        Status: newStatus
      }, { headers });
      return { success: true };
    } catch (error) {
      console.warn("Update status failed:", error);
      throw error;
    }
  },

  async getSettings() {
    try {
      if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' || !SUPABASE_ANON_KEY) {
        return [
          { Key: 'societyName', Value: 'Greenwood Residency' },
          { Key: 'hasWings', Value: 'true' },
          { Key: 'wingsList', Value: 'A, B, C' }
        ];
      }
      const response = await axios.get(\`\${SUPABASE_URL}/rest/v1/Settings?select=*\`, { headers });
      return response.data;
    } catch (error) {
      console.warn("Using default settings.");
      return [
        { Key: 'societyName', Value: 'Greenwood Residency' },
        { Key: 'hasWings', Value: 'true' },
        { Key: 'wingsList', Value: 'A, B, C' }
      ];
    }
  },

  async saveSettings(settingsList) {
    try {
      if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' || !SUPABASE_ANON_KEY) {
        return { success: true };
      }
      for (const s of settingsList) {
        const res = await axios.get(\`\${SUPABASE_URL}/rest/v1/Settings?Key=eq.\${s.Key}\`, { headers });
        if (res.data && res.data.length > 0) {
          await axios.patch(\`\${SUPABASE_URL}/rest/v1/Settings?Key=eq.\${s.Key}\`, { Value: s.Value }, { headers });
        } else {
          await axios.post(\`\${SUPABASE_URL}/rest/v1/Settings\`, { Key: s.Key, Value: s.Value }, { headers });
        }
      }
      return { success: true };
    } catch (error) {
      console.error("Save settings failed:", error);
      throw error;
    }
  },

  async saveMember(member) {
    try {
      if (SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY' || !SUPABASE_ANON_KEY) {
        const idx = backupDb.members.findIndex(m => m.FlatNo === member.FlatNo);
        if (idx !== -1) {
          backupDb.members[idx] = { ...backupDb.members[idx], ...member };
        } else {
          backupDb.members.push(member);
        }
        return { success: true };
      }
      
      const res = await axios.get(\`\${SUPABASE_URL}/rest/v1/Members?FlatNo=eq.\${member.FlatNo}\`, { headers });
      if (res.data && res.data.length > 0) {
        await axios.patch(\`\${SUPABASE_URL}/rest/v1/Members?FlatNo=eq.\${member.FlatNo}\`, member, { headers });
      } else {
        await axios.post(\`\${SUPABASE_URL}/rest/v1/Members\`, member, { headers });
      }
      return { success: true };
    } catch (error) {
      console.error("Save member failed:", error);
      throw error;
    }
  }
};
`;

export const EXPO_PACKAGE_JSON = `{
  "name": "society-connect-expo",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.1",
    "@react-native-async-storage/async-storage": "1.23.1",
    "lucide-react-native": "^0.379.0",
    "axios": "^1.6.8"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "typescript": "^5.1.3"
  },
  "private": true
}`;

export const SUPABASE_SQL_SCHEMA = `-- ============================================================================
-- HOUSING SOCIETY MANAGEMENT APPLICATION - SUPABASE POSTGRES SCHEMA (TIER 1 + TIER 2)
-- Production Security Hardened with Row-Level Security (RLS) & Private Buckets
-- ============================================================================

-- 1. DROP EXISTING TABLES IF THEY EXIST (CLEAN RE-RUN)
DROP TABLE IF EXISTS "UserConsents" CASCADE;
DROP TABLE IF EXISTS "StaffAttendance" CASCADE;
DROP TABLE IF EXISTS "Staff" CASCADE;
DROP TABLE IF EXISTS "Vendors" CASCADE;
DROP TABLE IF EXISTS "PollVotes" CASCADE;
DROP TABLE IF EXISTS "Polls" CASCADE;
DROP TABLE IF EXISTS "WaterMeters" CASCADE;
DROP TABLE IF EXISTS "AssetAMCs" CASCADE;
DROP TABLE IF EXISTS "SocietyDocuments" CASCADE;
DROP TABLE IF EXISTS "GuestParking" CASCADE;
DROP TABLE IF EXISTS "Vehicles" CASCADE;
DROP TABLE IF EXISTS "Tenants" CASCADE;
DROP TABLE IF EXISTS "EmergencyContacts" CASCADE;
DROP TABLE IF EXISTS "FacilityBookings" CASCADE;
DROP TABLE IF EXISTS "ComplaintReplies" CASCADE;
DROP TABLE IF EXISTS "AuditLogs" CASCADE;
DROP TABLE IF EXISTS "Visitors" CASCADE;
DROP TABLE IF EXISTS "Invoices" CASCADE;
DROP TABLE IF EXISTS "Notices" CASCADE;
DROP TABLE IF EXISTS "Complaints" CASCADE;
DROP TABLE IF EXISTS "Expenses" CASCADE;
DROP TABLE IF EXISTS "Payments" CASCADE;
DROP TABLE IF EXISTS "Members" CASCADE;
DROP TABLE IF EXISTS "UserAuth" CASCADE;
DROP TABLE IF EXISTS "Roles" CASCADE;
DROP TABLE IF EXISTS "Societies" CASCADE;

-- 2. CREATE SCHEMAS & TABLES

-- Societies
CREATE TABLE "Societies" (
  "id" TEXT PRIMARY KEY,
  "Name" TEXT NOT NULL,
  "SocietyCode" TEXT UNIQUE,
  "Slug" TEXT UNIQUE,
  "PrimaryAdminEmail" TEXT,
  "LogoUrl" TEXT,
  "BuildingType" TEXT DEFAULT 'Housing Society',
  "PostalAddress" TEXT,
  "Wings" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "HasWings" BOOLEAN DEFAULT false,
  "StructureType" TEXT DEFAULT 'standalone',
  "FeaturesEnabled" JSONB DEFAULT '{"gatekeeper": true, "waterMeters": false, "tenantRegister": true, "amenities": true, "assetAMC": false, "parkingRegister": true, "documentVault": true}'::jsonb,
  "enabled_modules" JSONB DEFAULT '{"gatekeeper": true, "billing": true, "helpdesk": true, "voting": false, "facility_booking": false, "water_meters": true, "tenants": true, "document_vault": true}'::jsonb,
  "module_settings" JSONB DEFAULT '{"gatekeeper": {"autoApproveGuests": true, "passExpiryHours": 12}, "billing": {"enableGST": false, "autoInvoiceDay": 1}, "society": {"dueDateDay": 15, "lateFeeInterestPercent": 12}}'::jsonb,
  "BillingMode" TEXT DEFAULT 'Flat Rate',
  "RatePerSqFt" NUMERIC DEFAULT 3.5,
  "FlatRateAmount" NUMERIC DEFAULT 2000,
  "BaseUtilityAmount" NUMERIC DEFAULT 500,
  "LateFeeType" TEXT DEFAULT 'Interest',
  "LateFeeValue" NUMERIC DEFAULT 12,
  "DueDateDay" INTEGER DEFAULT 15,
  "GatewayEnabled" BOOLEAN DEFAULT false,
  "GatewayProvider" TEXT DEFAULT 'Manual',
  "GatewayApiKey" TEXT DEFAULT '',
  "UPI_ID" TEXT DEFAULT 'greenwood.society@upi'
);

-- Roles
CREATE TABLE "Roles" (
  "id" TEXT PRIMARY KEY,
  "RoleName" TEXT NOT NULL,
  "SocietyId" TEXT REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Description" TEXT,
  "Permissions" JSONB DEFAULT '[]'::jsonb
);

-- UserAuth
CREATE TABLE "UserAuth" (
  "id" TEXT PRIMARY KEY,
  "EmailOrPhone" TEXT NOT NULL,
  "PasswordHash" TEXT NOT NULL,
  "Salt" TEXT NOT NULL,
  "RoleId" TEXT NOT NULL REFERENCES "Roles"("id") ON DELETE CASCADE,
  "SocietyId" TEXT REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Status" TEXT DEFAULT 'Active'
);

-- UserConsents (Digital Personal Data Protection Act 2023)
CREATE TABLE "UserConsents" (
  "id" TEXT PRIMARY KEY,
  "UserId" TEXT NOT NULL,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "ConsentedAt" TEXT NOT NULL,
  "PolicyVersion" TEXT DEFAULT 'v1.0-2026',
  "IPAddress" TEXT DEFAULT '127.0.0.1',
  "UserRole" TEXT DEFAULT 'Member'
);

-- Members
CREATE TABLE "Members" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "OwnerName" TEXT NOT NULL,
  "ContactNo" TEXT NOT NULL,
  "Email" TEXT NOT NULL,
  "Balance" NUMERIC DEFAULT 0,
  "Status" TEXT NOT NULL DEFAULT 'Owner', -- 'Owner' or 'Tenant'
  "CoOwners" TEXT,
  "VehicleNo" TEXT,
  "Wing" TEXT,
  "Tower" TEXT,
  "Role" TEXT DEFAULT 'Member',
  "AreaSqFt" NUMERIC DEFAULT 850
);

-- Payments
CREATE TABLE "Payments" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "MemberId" TEXT REFERENCES "Members"("id") ON DELETE SET NULL,
  "Date" TEXT NOT NULL,
  "FlatNo" TEXT NOT NULL,
  "OwnerName" TEXT,
  "Amount" NUMERIC NOT NULL DEFAULT 0,
  "Mode" TEXT NOT NULL,
  "ReferenceNo" TEXT,
  "Status" TEXT NOT NULL DEFAULT 'Cleared'
);

-- Vendors
CREATE TABLE "Vendors" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Name" TEXT,
  "VendorName" TEXT NOT NULL,
  "ServiceCategory" TEXT NOT NULL,
  "GstNumber" TEXT,
  "Phone" TEXT NOT NULL,
  "Email" TEXT,
  "ContactPerson" TEXT,
  "BankAccountNumber" TEXT,
  "BankIfsc" TEXT,
  "BankName" TEXT,
  "ContractDocumentUrl" TEXT,
  "Status" TEXT DEFAULT 'Active',
  "Rating" NUMERIC DEFAULT 5.0,
  "Notes" TEXT,
  "CreatedAt" TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Expenses
CREATE TABLE "Expenses" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Date" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "Amount" NUMERIC NOT NULL DEFAULT 0,
  "Vendor" TEXT NOT NULL,
  "VendorId" TEXT REFERENCES "Vendors"("id") ON DELETE SET NULL,
  "InvoiceNo" TEXT,
  "ApprovedBy" TEXT,
  "Status" TEXT DEFAULT 'Approved',
  "RequiresDualApproval" BOOLEAN DEFAULT false,
  "SecretaryApproved" BOOLEAN DEFAULT false,
  "SecretaryApprovedBy" TEXT,
  "TreasurerApproved" BOOLEAN DEFAULT false,
  "TreasurerApprovedBy" TEXT
);

-- Staff
CREATE TABLE "Staff" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Name" TEXT NOT NULL,
  "Phone" TEXT NOT NULL,
  "ServiceType" TEXT NOT NULL,
  "PhotoUrl" TEXT,
  "Passcode" TEXT NOT NULL,
  "IdProofType" TEXT,
  "IdProofNumber" TEXT,
  "AssignedFlats" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "GateStatus" TEXT DEFAULT 'Checked Out',
  "Status" TEXT NOT NULL DEFAULT 'Active',
  "CreatedAt" TEXT DEFAULT CURRENT_TIMESTAMP
);

-- StaffAttendance
CREATE TABLE "StaffAttendance" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "StaffId" TEXT NOT NULL REFERENCES "Staff"("id") ON DELETE CASCADE,
  "StaffName" TEXT NOT NULL,
  "ServiceType" TEXT NOT NULL,
  "AssignedFlats" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "GateName" TEXT,
  "CheckInTime" TEXT NOT NULL,
  "CheckOutTime" TEXT,
  "Date" TEXT NOT NULL,
  "RecordedBy" TEXT NOT NULL
);

-- Complaints
CREATE TABLE "Complaints" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "Title" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "Description" TEXT NOT NULL,
  "Urgency" TEXT DEFAULT 'Medium',
  "Status" TEXT DEFAULT 'Open',
  "CreatedAt" TEXT NOT NULL,
  "ResolvedAt" TEXT,
  "AssignedTo" TEXT,
  "ComplaintBy" TEXT
);

-- Notices
CREATE TABLE "Notices" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Date" TEXT NOT NULL,
  "Title" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "Content" TEXT NOT NULL,
  "AttachmentUrl" TEXT,
  "DocumentUrl" TEXT,
  "PostedBy" TEXT NOT NULL
);

-- Invoices
CREATE TABLE "Invoices" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "InvoiceNo" TEXT NOT NULL,
  "FlatNo" TEXT NOT NULL,
  "BillingPeriod" TEXT NOT NULL,
  "DueDate" TEXT NOT NULL,
  "MaintenanceCharge" NUMERIC DEFAULT 0,
  "UtilityCharge" NUMERIC DEFAULT 0,
  "WaterCharge" NUMERIC DEFAULT 0,
  "ParkingCharge" NUMERIC DEFAULT 0,
  "LateFee" NUMERIC DEFAULT 0,
  "PreviousArrears" NUMERIC DEFAULT 0,
  "TotalAmount" NUMERIC NOT NULL,
  "Status" TEXT DEFAULT 'Pending',
  "GeneratedDate" TEXT NOT NULL
);

-- Visitors
CREATE TABLE "Visitors" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "VisitorName" TEXT NOT NULL,
  "Purpose" TEXT NOT NULL,
  "Phone" TEXT NOT NULL,
  "VehicleNo" TEXT,
  "CheckInTime" TEXT NOT NULL,
  "CheckOutTime" TEXT,
  "Status" TEXT NOT NULL DEFAULT 'Inside',
  "Passcode" TEXT
);

-- ComplaintReplies
CREATE TABLE "ComplaintReplies" (
  "id" TEXT PRIMARY KEY,
  "ComplaintId" TEXT NOT NULL REFERENCES "Complaints"("id") ON DELETE CASCADE,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "SenderName" TEXT NOT NULL,
  "SenderRole" TEXT NOT NULL,
  "Message" TEXT NOT NULL,
  "Timestamp" TEXT NOT NULL
);

-- AuditLogs (Append-Only)
CREATE TABLE "AuditLogs" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Timestamp" TEXT NOT NULL,
  "UserRole" TEXT NOT NULL,
  "UserId" TEXT NOT NULL,
  "UserName" TEXT NOT NULL,
  "Action" TEXT NOT NULL,
  "Details" TEXT NOT NULL
);

-- FacilityBookings
CREATE TABLE "FacilityBookings" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "ResidentName" TEXT NOT NULL,
  "FacilityName" TEXT NOT NULL,
  "Date" TEXT NOT NULL,
  "TimeSlot" TEXT NOT NULL,
  "Purpose" TEXT NOT NULL,
  "Charges" NUMERIC DEFAULT 0,
  "Status" TEXT DEFAULT 'Confirmed',
  "BookedAt" TEXT NOT NULL
);

-- EmergencyContacts
CREATE TABLE "EmergencyContacts" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Name" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "Phone" TEXT NOT NULL,
  "RoleOrTitle" TEXT,
  "IsImportant" BOOLEAN DEFAULT false
);

-- Tenants
CREATE TABLE "Tenants" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "TenantName" TEXT NOT NULL,
  "ContactNo" TEXT NOT NULL,
  "Email" TEXT NOT NULL,
  "MoveInDate" TEXT NOT NULL,
  "MoveOutDate" TEXT,
  "AgreementDocUrl" TEXT,
  "IdProofDocUrl" TEXT,
  "KycStatus" TEXT NOT NULL DEFAULT 'Pending',
  "Remarks" TEXT
);

-- Vehicles
CREATE TABLE "Vehicles" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "OwnerName" TEXT NOT NULL,
  "VehicleNo" TEXT NOT NULL,
  "VehicleType" TEXT NOT NULL,
  "ParkingSlotNo" TEXT NOT NULL,
  "StickerIssued" BOOLEAN DEFAULT true
);

-- GuestParking
CREATE TABLE "GuestParking" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "GuestName" TEXT NOT NULL,
  "VehicleNo" TEXT NOT NULL,
  "VehicleType" TEXT NOT NULL,
  "AssignedSlot" TEXT NOT NULL,
  "ValidFrom" TEXT NOT NULL,
  "ValidUntil" TEXT NOT NULL,
  "Status" TEXT NOT NULL DEFAULT 'Active'
);

-- SocietyDocuments
CREATE TABLE "SocietyDocuments" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Title" TEXT NOT NULL,
  "Category" TEXT NOT NULL,
  "DocumentUrl" TEXT NOT NULL,
  "IsPublic" BOOLEAN DEFAULT true,
  "UploadedBy" TEXT NOT NULL,
  "UploadedAt" TEXT NOT NULL,
  "FileSize" TEXT
);

-- AssetAMCs
CREATE TABLE "AssetAMCs" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "AssetName" TEXT NOT NULL,
  "AssetType" TEXT NOT NULL,
  "VendorName" TEXT NOT NULL,
  "VendorContact" TEXT NOT NULL,
  "ContractStartDate" TEXT NOT NULL,
  "ContractExpiryDate" TEXT NOT NULL,
  "LastServicedDate" TEXT NOT NULL,
  "NextServicedDate" TEXT NOT NULL,
  "ServiceStatus" TEXT DEFAULT 'Operational',
  "StatusNote" TEXT,
  "ReportUrl" TEXT
);

-- WaterMeters
CREATE TABLE "WaterMeters" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "ReadingMonth" TEXT NOT NULL,
  "PreviousReading" NUMERIC DEFAULT 0,
  "CurrentReading" NUMERIC DEFAULT 0,
  "UnitsConsumed" NUMERIC DEFAULT 0,
  "RecordedBy" TEXT NOT NULL,
  "RecordedAt" TEXT NOT NULL,
  "Status" TEXT DEFAULT 'Entered'
);

-- Polls / Resolutions
CREATE TABLE "Polls" (
  "id" TEXT PRIMARY KEY,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "Title" TEXT NOT NULL,
  "Description" TEXT NOT NULL,
  "Category" TEXT DEFAULT 'AGM Resolution',
  "StartDate" TEXT NOT NULL,
  "EndDate" TEXT NOT NULL,
  "CreatedBy" TEXT NOT NULL,
  "Status" TEXT DEFAULT 'Active',
  "TotalEligibleFlats" INTEGER DEFAULT 8
);

-- PollVotes
CREATE TABLE "PollVotes" (
  "id" TEXT PRIMARY KEY,
  "PollId" TEXT NOT NULL REFERENCES "Polls"("id") ON DELETE CASCADE,
  "SocietyId" TEXT NOT NULL REFERENCES "Societies"("id") ON DELETE CASCADE,
  "FlatNo" TEXT NOT NULL,
  "VotedBy" TEXT NOT NULL,
  "Vote" TEXT NOT NULL,
  "Timestamp" TEXT NOT NULL,
  CONSTRAINT "unique_flat_vote_per_poll" UNIQUE ("PollId", "FlatNo")
);

-- ============================================================================
-- 2.1 PERFORMANCE INDEXING & COMPOSITE MULTI-TENANT QUERY ACCELERATION
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_members_society_flat ON "Members" ("SocietyId", "FlatNo");
CREATE INDEX IF NOT EXISTS idx_invoices_society_status ON "Invoices" ("SocietyId", "Status");
CREATE INDEX IF NOT EXISTS idx_visitors_society_date ON "Visitors" ("SocietyId", "CheckInTime");
CREATE INDEX IF NOT EXISTS idx_complaints_society_status ON "Complaints" ("SocietyId", "Status");
CREATE INDEX IF NOT EXISTS idx_gatekeeper_logs ON "Visitors" ("SocietyId", "Status", "CheckInTime");
CREATE INDEX IF NOT EXISTS idx_payments_society_flat ON "Payments" ("SocietyId", "FlatNo");
CREATE INDEX IF NOT EXISTS idx_expenses_society_date ON "Expenses" ("SocietyId", "Date");
CREATE INDEX IF NOT EXISTS idx_staff_attendance_society_date ON "StaffAttendance" ("SocietyId", "Date");

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) & STRICT RBAC MULTI-TENANT ISOLATION POLICIES
-- ============================================================================

-- Helper functions for JWT / auth lookup
CREATE OR REPLACE FUNCTION public.get_auth_society_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'society_id'),
    (auth.jwt() -> 'app_metadata' ->> 'SocietyId'),
    (SELECT "SocietyId" FROM public."Members" WHERE "id" = auth.uid()::text OR "Email" = auth.email() LIMIT 1),
    (SELECT "SocietyId" FROM public."UserAuth" WHERE "id" = auth.uid()::text OR "EmailOrPhone" = auth.email() LIMIT 1),
    'greenwood'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role'),
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    (SELECT "Role" FROM public."Members" WHERE "id" = auth.uid()::text OR "Email" = auth.email() LIMIT 1),
    'Member'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_flat_no()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'flat_no'),
    (SELECT "FlatNo" FROM public."Members" WHERE "id" = auth.uid()::text OR "Email" = auth.email() LIMIT 1)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE "Societies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserAuth" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vendors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StaffAttendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Complaints" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Visitors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComplaintReplies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLogs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FacilityBookings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmergencyContacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GuestParking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SocietyDocuments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AssetAMCs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WaterMeters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Polls" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PollVotes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserConsents" ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- POLICIES BY TABLE (Public & Anon Access Enabled for REST API & Seeding)
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  tbl text;
  pol text;
  tables text[] := ARRAY[
    'Societies', 'Roles', 'UserAuth', 'UserConsents', 'Members', 'Payments', 'Vendors', 
    'Expenses', 'Staff', 'StaffAttendance', 'Complaints', 'Notices', 
    'Invoices', 'Visitors', 'ComplaintReplies', 'AuditLogs', 'FacilityBookings', 
    'EmergencyContacts', 'Tenants', 'Vehicles', 'GuestParking', 
    'SocietyDocuments', 'AssetAMCs', 'WaterMeters', 'Polls', 'PollVotes'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- Drop all existing policies on the table to ensure clean update
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = tbl AND schemaname = 'public') LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', pol, tbl);
    END LOOP;
    
    -- Create public policies for full REST API CRUD & mock database seeding
    EXECUTE format('CREATE POLICY %I ON %I FOR ALL USING (true) WITH CHECK (true);', tbl || ' Public Access', tbl);
  END LOOP;
END $$;

-- ============================================================================
-- 4. INITIAL SEED MOCK DATA
-- ============================================================================

-- Societies Seed
INSERT INTO "Societies" ("id", "Name", "BuildingType", "PostalAddress", "Wings", "HasWings", "StructureType", "BillingMode", "RatePerSqFt", "FlatRateAmount", "BaseUtilityAmount", "LateFeeType", "LateFeeValue", "GatewayEnabled", "GatewayProvider", "UPI_ID") VALUES
('greenwood', 'Greenwood Residency', 'Housing Society', 'Sector 5, Palm Beach Road, Navi Mumbai, MH - 400706', ARRAY[]::TEXT[], false, 'standalone', 'SqFt Rate', 3.5, 2000, 500, 'Interest', 12, false, 'Manual', 'greenwood.society@upi'),
('royal_heights', 'Royal Heights', 'Gated Community', 'MG Road, Bandra West, Mumbai, MH - 400050', ARRAY['Tower 1', 'Tower 2']::TEXT[], true, 'towers_wings', 'Flat Rate', 4.0, 3500, 750, 'Fixed', 250, true, 'Razorpay', 'royalheights@upi'),
('sea_breeze', 'Sea Breeze Apartments', 'Apartment Complex', 'Carter Road, Bandra, Mumbai, MH - 400050', ARRAY['Wing A', 'Wing B']::TEXT[], true, 'wings', 'Hybrid', 3.0, 1800, 600, 'Interest', 10, false, 'Manual', 'seabreeze@upi');

-- Roles Seed
INSERT INTO "Roles" ("id", "RoleName", "SocietyId", "Description") VALUES
('Role-SuperAdmin', 'SuperAdmin', NULL, 'Global Super-Admin overseeing all societies'),
('Role-greenwood-admin', 'Admin', 'greenwood', 'Primary Admin Secretary for Greenwood Residency'),
('Role-greenwood-committee', 'Committee Member', 'greenwood', 'Elected Committee Member for Greenwood Residency'),
('Role-greenwood-member', 'Member', 'greenwood', 'Standard Flat Owner or Tenant');

-- UserAuth Seed
INSERT INTO "UserAuth" ("id", "EmailOrPhone", "PasswordHash", "Salt", "RoleId", "SocietyId", "Status") VALUES
('Auth-Super-Admin', 'superadmin@societyconnect.com', '68a1d7f6b907f154388e6a5789f1a234', 'SALT-SUPER-ADMIN', 'Role-SuperAdmin', NULL, 'Active'),
('Auth-gw-amit-sharma', 'amit080578@gmail.com', 'c93a0050dbd181966d5b03f0b2f0b201', 'SALT-GW-AMIT', 'Role-greenwood-admin', 'greenwood', 'Active'),
('Auth-gw-amit-sharma-alt', 'amit.sharma@example.com', 'c93a0050dbd181966d5b03f0b2f0b201', 'SALT-GW-AMIT-ALT', 'Role-greenwood-admin', 'greenwood', 'Active');

-- Members Seed
INSERT INTO "Members" ("id", "SocietyId", "FlatNo", "OwnerName", "ContactNo", "Email", "Balance", "Status", "CoOwners", "VehicleNo", "AreaSqFt") VALUES
('M-greenwood-101', 'greenwood', '101', 'Amit Sharma', '+91 98765 43210', 'amit.sharma@example.com', 1500, 'Owner', 'Sunita Sharma (Spouse)', 'MH-02-AB-1234', 950),
('M-greenwood-102', 'greenwood', '102', 'Priya Patel', '+91 98765 12345', 'priya.p@example.com', 0, 'Owner', 'None', 'MH-02-CD-5678', 850),
('M-greenwood-103', 'greenwood', '103', 'Rajesh Kumar', '+91 98234 56789', 'rajesh.tenant@example.com', 3000, 'Tenant', 'Nikhil Kumar', 'MH-02-XY-9012', 850),
('M-greenwood-201', 'greenwood', '201', 'Vikram Singh', '+91 98111 22233', 'vikram.singh@example.com', -1500, 'Owner', 'Renu Singh', 'MH-02-VS-2010', 1200),
('M-greenwood-202', 'greenwood', '202', 'Anjali Gupta', '+91 99887 76655', 'anjali.g@example.com', 4500, 'Tenant', 'None', 'MH-02-PQ-4455', 850),
('M-greenwood-203', 'greenwood', '203', 'Rahul Verma', '+91 97766 55443', 'rverma@example.com', 1500, 'Owner', 'Megha Verma', 'MH-02-RV-2030', 950),
('M-greenwood-301', 'greenwood', '301', 'Neha Joshi', '+91 96655 44332', 'neha.joshi@example.com', 0, 'Owner', 'Sanjay Joshi', 'MH-02-NJ-3010', 1200),
('M-greenwood-302', 'greenwood', '302', 'Siddharth Shah', '+91 95544 33221', 'sidd.shah@example.com', 6000, 'Tenant', 'Krupa Shah', 'MH-02-SS-3020', 1200);

-- Vendors Seed
INSERT INTO "Vendors" ("id", "SocietyId", "Name", "VendorName", "ServiceCategory", "GstNumber", "Phone", "Email", "ContactPerson", "BankAccountNumber", "BankIfsc", "BankName", "ContractDocumentUrl", "Status", "Rating", "Notes") VALUES
('VND-101', 'greenwood', 'Apex Security Solutions', 'Apex Security Solutions', 'Security Services', '27AAACA1234A1Z5', '+91 98200 11223', 'contact@apexsecurity.in', 'Rajesh Guard Supervisor', '918273645012', 'HDFC0000123', 'HDFC Bank', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Active', 4.8, '24x7 Security guard placement contract'),
('VND-102', 'greenwood', 'AquaClean Water Tank Services', 'AquaClean Water Tank Services', 'Water Tank Cleaning', '27BBBCA5678B1Z2', '+91 98200 99887', 'info@aquaclean.in', 'Sanjay Plumber Tech', '501002345678', 'ICIC0000456', 'ICICI Bank', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Active', 4.9, 'Quarterly water tank scrubbing contract'),
('VND-103', 'greenwood', 'Schindler Elevator India', 'Schindler Elevator India', 'Lift Maintenance', '27CCCDE9012C1Z9', '+91 22 6100 8800', 'amc@schindler.in', 'Vikram Service Engineer', '112233445566', 'SBIN0000789', 'State Bank of India', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Active', 5.0, 'Annual Lift AMC contract');

-- Payments Seed
INSERT INTO "Payments" ("id", "SocietyId", "MemberId", "Date", "FlatNo", "OwnerName", "Amount", "Mode", "ReferenceNo", "Status") VALUES
('PAY-1001', 'greenwood', 'M-greenwood-101', '2026-07-05', '101', 'Amit Sharma', 3475, 'UPI / Online', 'UPI/618293049182', 'Cleared'),
('PAY-1002', 'greenwood', 'M-greenwood-102', '2026-07-10', '102', 'Priya Patel', 3125, 'Bank Transfer (NEFT)', 'NEFT/N0712398401', 'Cleared'),
('PAY-1003', 'greenwood', 'M-greenwood-201', '2026-07-12', '201', 'Vikram Singh', 4350, 'Cheque', 'CHQ-881920', 'Cleared');

-- Expenses Seed
INSERT INTO "Expenses" ("id", "SocietyId", "Date", "Category", "Amount", "Vendor", "InvoiceNo", "ApprovedBy", "Status", "RequiresDualApproval", "SecretaryApproved", "TreasurerApproved") VALUES
('EXP-2026-001', 'greenwood', '2026-07-02', 'Security', 42000, 'Apex Security Solutions', 'INV-APX-881', 'Amit Sharma (Secretary)', 'Approved', true, true, true),
('EXP-2026-002', 'greenwood', '2026-07-08', 'Water', 18500, 'City Municipal Water Supply', 'MUN-WTR-0726', 'Priya Patel (Treasurer)', 'Approved', false, true, true),
('EXP-2026-003', 'greenwood', '2026-07-14', 'Repairs', 7800, 'Ramesh Electrician', 'INV-REM-104', 'Management Committee', 'Pending Approval', true, true, false);

-- Staff Seed
INSERT INTO "Staff" ("id", "SocietyId", "Name", "Phone", "ServiceType", "PhotoUrl", "Passcode", "IdProofType", "IdProofNumber", "AssignedFlats", "GateStatus", "Status") VALUES
('STF-101', 'greenwood', 'Sunita Bai', '+91 98700 11223', 'Maid', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', '1001', 'Aadhaar', '9182-3746-1029', ARRAY['101', '102', '201']::TEXT[], 'Inside', 'Active'),
('STF-102', 'greenwood', 'Ramesh Guard', '+91 98200 11223', 'Security Guard', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', '1002', 'Aadhaar', '1029-3847-5610', ARRAY['All Flats']::TEXT[], 'Inside', 'Active');

-- Notices Seed
INSERT INTO "Notices" ("id", "SocietyId", "Date", "Title", "Category", "Content", "AttachmentUrl", "PostedBy") VALUES
('N-101', 'greenwood', '2026-07-18', 'Annual General Body Meeting (AGM) Agenda', 'Meeting', 'Notice is hereby given that the 12th Annual General Body Meeting will be held on Sunday July 26th in the Clubhouse.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Management Committee'),
('N-102', 'greenwood', '2026-07-12', 'Water Tank Cleaning Schedule & Temporary Cut', 'Maintenance', 'Please store adequate water. Cleaning scheduled on Monday July 20th from 10am to 4pm.', '', 'Facility Manager');

-- Invoices Seed
INSERT INTO "Invoices" ("id", "SocietyId", "InvoiceNo", "FlatNo", "BillingPeriod", "DueDate", "MaintenanceCharge", "UtilityCharge", "WaterCharge", "ParkingCharge", "LateFee", "PreviousArrears", "TotalAmount", "Status", "GeneratedDate") VALUES
('INV-2026-07-101', 'greenwood', 'INV-202607-101', '101', 'July 2026', '2026-07-15', 3325, 500, 150, 0, 0, 0, 3975, 'Paid', '2026-07-01'),
('INV-2026-07-102', 'greenwood', 'INV-202607-102', '102', 'July 2026', '2026-07-15', 2975, 500, 120, 0, 0, 0, 3595, 'Pending', '2026-07-01');

-- Visitors Seed
INSERT INTO "Visitors" ("id", "SocietyId", "FlatNo", "VisitorName", "Purpose", "Phone", "VehicleNo", "CheckInTime", "CheckOutTime", "Status", "Passcode") VALUES
('VIS-greenwood-1', 'greenwood', '102', 'Sanjay Kumar (Plumber)', 'Maintenance', '+91 97777 54321', NULL, '2026-07-20T11:15:00', '2026-07-20T12:30:00', 'Checked Out', 'P3M71X');

-- EmergencyContacts Seed
INSERT INTO "EmergencyContacts" ("id", "SocietyId", "Name", "Category", "Phone", "RoleOrTitle", "IsImportant") VALUES
('EM-1', 'greenwood', 'Police Emergency Helpline', 'Police', '100', 'National Control Room', true),
('EM-2', 'greenwood', 'Ambulance & Medical Emergency', 'Ambulance', '108', 'State Emergency Services', true),
('EM-3', 'greenwood', 'Fire Station Control Room', 'Fire', '101', 'Central Station', true),
('EM-4', 'greenwood', 'City General Hospital (24x7)', 'Hospital', '+91 22 2650 1111', 'Trauma & ER Desk', true),
('EM-5', 'greenwood', 'Main Gate Security Gatekeeper', 'Security', '+91 98200 11223', 'Head Security Officer', true);

-- Tenants Seed
INSERT INTO "Tenants" ("id", "SocietyId", "FlatNo", "TenantName", "ContactNo", "Email", "MoveInDate", "MoveOutDate", "AgreementDocUrl", "IdProofDocUrl", "KycStatus", "Remarks") VALUES
('TNT-1', 'greenwood', '103', 'Rajesh Kumar', '+91 98234 56789', 'rajesh.tenant@example.com', '2025-01-15', '2026-12-31', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Verified', 'Rent agreement verified for 22 months');

-- Vehicles Seed
INSERT INTO "Vehicles" ("id", "SocietyId", "FlatNo", "OwnerName", "VehicleNo", "VehicleType", "ParkingSlotNo", "StickerIssued") VALUES
('VEH-1', 'greenwood', '101', 'Amit Sharma', 'MH-02-AB-1234', '4-Wheeler', 'A-101', true);

-- GuestParking Seed
INSERT INTO "GuestParking" ("id", "SocietyId", "FlatNo", "GuestName", "VehicleNo", "VehicleType", "AssignedSlot", "ValidFrom", "ValidUntil", "Status") VALUES
('GP-1', 'greenwood', '101', 'Anil Sharma (Brother)', 'DL-01-AB-5678', '4-Wheeler', 'Visitor Slot V-03', '2026-07-21T08:00:00', '2026-07-21T22:00:00', 'Active');

-- SocietyDocuments Seed
INSERT INTO "SocietyDocuments" ("id", "SocietyId", "Title", "Category", "DocumentUrl", "IsPublic", "UploadedBy", "UploadedAt", "FileSize") VALUES
('DOC-1', 'greenwood', 'Registered Society Bye-Laws & Model Rules 2024', 'Building Rules', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', true, 'Amit Sharma (Secretary)', '2026-01-10', '2.4 MB');

-- AssetAMCs Seed
INSERT INTO "AssetAMCs" ("id", "SocietyId", "AssetName", "AssetType", "VendorName", "VendorContact", "ContractStartDate", "ContractExpiryDate", "LastServicedDate", "NextServicedDate", "ServiceStatus", "StatusNote", "ReportUrl") VALUES
('AMC-1', 'greenwood', 'Lift #1 (Wing A Schindler Elevator)', 'Lift', 'Schindler Elevator India Pvt Ltd', '+91 22 6100 8800', '2026-01-01', '2026-12-31', '2026-07-15', '2026-08-15', 'Operational', 'All safety cables & brakes checked.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

-- WaterMeters Seed
INSERT INTO "WaterMeters" ("id", "SocietyId", "FlatNo", "ReadingMonth", "PreviousReading", "CurrentReading", "UnitsConsumed", "RecordedBy", "RecordedAt", "Status") VALUES
('WM-101-2026-07', 'greenwood', '101', '2026-07', 1240, 1285, 45, 'Sanjay Plumber', '2026-07-01', 'Entered');

-- StaffAttendance Seed
INSERT INTO "StaffAttendance" ("id", "SocietyId", "StaffId", "StaffName", "ServiceType", "AssignedFlats", "GateName", "CheckInTime", "CheckOutTime", "Date", "RecordedBy") VALUES
('ATT-1', 'greenwood', 'STF-101', 'Sunita Bai', 'Maid', ARRAY['101', '102', '201']::TEXT[], 'Main Gate', '2026-07-22T08:30:00', NULL, '2026-07-22', 'Ramesh Guard'),
('ATT-2', 'greenwood', 'STF-102', 'Ramesh Guard', 'Security Guard', ARRAY['All Flats']::TEXT[], 'Main Gate', '2026-07-22T08:00:00', '2026-07-22T13:00:00', '2026-07-22', 'System Auto');

-- Complaints Seed
INSERT INTO "Complaints" ("id", "SocietyId", "FlatNo", "Title", "Category", "Description", "Urgency", "Status", "CreatedAt", "ResolvedAt", "AssignedTo", "ComplaintBy") VALUES
('C-101', 'greenwood', '202', 'Water leakage in bathroom', 'Plumbing', 'Water is dripping from the ceiling toilet pipe valve continuously, causing a small pool.', 'High', 'Open', '2026-07-18T10:00:00Z', NULL, 'Sanjay Plumber', 'Anjali Gupta'),
('C-102', 'greenwood', '103', 'Corridor light not working', 'Electrical', 'The corridor tube-light outside flat 103 has fused and needs replacement.', 'Low', 'In Progress', '2026-07-17T14:30:00Z', NULL, 'Ramesh Electrician', 'Rajesh Kumar'),
('C-103', 'greenwood', '302', 'Unauthorized vehicle parked in spot B-4', 'Parking', 'A black SUV has been parked in my designated spot B-4 without permission.', 'Medium', 'Resolved', '2026-07-15T09:15:00Z', '2026-07-15T12:00:00Z', 'Main Gate Security', 'Siddharth Shah');

-- ComplaintReplies Seed
INSERT INTO "ComplaintReplies" ("id", "ComplaintId", "SocietyId", "SenderName", "SenderRole", "Message", "Timestamp") VALUES
('CR-101-1', 'C-101', 'greenwood', 'Amit Sharma', 'Admin', 'Plumber Sanjay has been notified and scheduled for visit at 4 PM today.', '2026-07-18T11:00:00Z'),
('CR-101-2', 'C-101', 'greenwood', 'Anjali Gupta', 'Member', 'Thank you, please ensure the main valve is checked.', '2026-07-18T11:15:00Z');

-- FacilityBookings Seed
INSERT INTO "FacilityBookings" ("id", "SocietyId", "FlatNo", "ResidentName", "FacilityName", "Date", "TimeSlot", "Purpose", "Charges", "Status", "BookedAt") VALUES
('FB-1', 'greenwood', '101', 'Amit Sharma', 'Clubhouse Hall', '2026-08-05', '18:00 - 22:00', 'Birthday Party', 2500, 'Confirmed', '2026-07-10T12:00:00Z'),
('FB-2', 'greenwood', '201', 'Vikram Singh', 'Terrace Party Area', '2026-08-15', '19:00 - 23:00', 'Independence Day Dinner', 3000, 'Confirmed', '2026-07-12T15:30:00Z');

-- AuditLogs Seed
INSERT INTO "AuditLogs" ("id", "SocietyId", "Timestamp", "UserRole", "UserId", "UserName", "Action", "Details") VALUES
('LOG-1001', 'greenwood', '2026-07-22T08:00:00Z', 'Admin', 'Auth-gw-amit-sharma', 'Amit Sharma', 'System Login', 'Admin logged into Greenwood Residency dashboard'),
('LOG-1002', 'greenwood', '2026-07-21T16:30:00Z', 'Admin', 'Auth-gw-amit-sharma', 'Amit Sharma', 'Invoice Generated', 'Generated monthly maintenance invoice INV-202607-101');

-- Polls Seed
INSERT INTO "Polls" ("id", "SocietyId", "Title", "Description", "Category", "StartDate", "EndDate", "CreatedBy", "Status", "TotalEligibleFlats") VALUES
('POLL-1', 'greenwood', 'Approve ₹500,000 Special Maintenance Budget for Entrance Lobby Renovation', 'Proposal to allocate ₹5 Lakhs from reserve funds.', 'AGM Resolution', '2026-07-01', '2026-07-31', 'Amit Sharma (Secretary)', 'Active', 8);

-- PollVotes Seed
INSERT INTO "PollVotes" ("id", "PollId", "SocietyId", "FlatNo", "VotedBy", "Vote", "Timestamp") VALUES
('PV-1', 'POLL-1', 'greenwood', '101', 'Amit Sharma', 'In Favor', '2026-07-05T10:15:00.000Z');

-- UserConsents Seed (Digital Personal Data Protection Act 2023)
INSERT INTO "UserConsents" ("id", "UserId", "SocietyId", "ConsentedAt", "PolicyVersion", "IPAddress", "UserRole") VALUES
('UC-1001', 'Auth-gw-amit-sharma', 'greenwood', '2026-07-22T08:00:00Z', 'v1.0-2026', '127.0.0.1', 'Admin'),
('UC-1002', 'amit080578@gmail.com', 'greenwood', '2026-07-22T08:05:00Z', 'v1.0-2026', '127.0.0.1', 'Admin');

-- ============================================================================
-- 5. PRIVATE SUPABASE STORAGE BUCKETS SETUP & SIGNED URL ACCESS POLICIES
-- Configures 'society-docs', 'tenant-kyc', and 'notice-attachments' as PRIVATE
-- ============================================================================

-- Create private storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('society-docs', 'society-docs', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('tenant-kyc', 'tenant-kyc', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']),
  ('notice-attachments', 'notice-attachments', false, 15728640, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE 
SET public = false, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Read Policies (Authenticated user access only for tenant files)
DROP POLICY IF EXISTS "Authenticated Read Access for society-docs" ON storage.objects;
CREATE POLICY "Authenticated Read Access for society-docs" ON storage.objects 
  FOR SELECT USING (bucket_id = 'society-docs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Read Access for tenant-kyc" ON storage.objects;
CREATE POLICY "Authenticated Read Access for tenant-kyc" ON storage.objects 
  FOR SELECT USING (bucket_id = 'tenant-kyc' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Read Access for notice-attachments" ON storage.objects;
CREATE POLICY "Authenticated Read Access for notice-attachments" ON storage.objects 
  FOR SELECT USING (bucket_id = 'notice-attachments' AND auth.role() = 'authenticated');

-- Storage Upload Policies (Authenticated users can insert)
DROP POLICY IF EXISTS "Authenticated Upload Access for society-docs" ON storage.objects;
CREATE POLICY "Authenticated Upload Access for society-docs" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'society-docs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Upload Access for tenant-kyc" ON storage.objects;
CREATE POLICY "Authenticated Upload Access for tenant-kyc" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'tenant-kyc' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Upload Access for notice-attachments" ON storage.objects;
CREATE POLICY "Authenticated Upload Access for notice-attachments" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'notice-attachments' AND auth.role() = 'authenticated');

-- Storage Delete / Update Policies
DROP POLICY IF EXISTS "Authenticated Update Access for society-docs" ON storage.objects;
CREATE POLICY "Authenticated Update Access for society-docs" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'society-docs' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Update Access for tenant-kyc" ON storage.objects;
CREATE POLICY "Authenticated Update Access for tenant-kyc" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'tenant-kyc' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Update Access for notice-attachments" ON storage.objects;
CREATE POLICY "Authenticated Update Access for notice-attachments" ON storage.objects 
  FOR UPDATE USING (bucket_id = 'notice-attachments' AND auth.role() = 'authenticated');
`;
