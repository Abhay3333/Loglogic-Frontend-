import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { getOrganizations } from '../api/organization';

export default function ProtectedDashboard() {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchOrgs = useCallback(async () => {
    try {
      const responseData = await getOrganizations();
      const orgList = responseData.organizations || [];
      setOrganizations(orgList);
      if (orgList.length > 0) {
        setCurrentOrg(prev => {
          if (prev && orgList.some(o => o.id === prev.id)) {
            return orgList.find(o => o.id === prev.id);
          }
          return orgList[0];
        });
      } else {
        setCurrentOrg(null);
      }
      return orgList;
    } catch (err) {
      console.error("Error checking workspace status via API:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    const checkUserAndOrg = async () => {
      // 1. Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      // 2. Query Express API backend to see if they belong to any org
      const orgList = await fetchOrgs();
      const hasOrg = orgList.length > 0;

      if (!hasOrg && location.pathname !== '/app/onboarding') {
        navigate('/app/onboarding');
      } else if (hasOrg && location.pathname === '/app/onboarding') {
        navigate('/app/dashboard');
      } else {
        setLoading(false);
      }
    };
    
    checkUserAndOrg();
  }, [navigate, location.pathname, fetchOrgs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center font-mono text-primary">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <span>[VERIFYING WORKSPACE STATUS...]</span>
      </div>
    );
  }

  return (
    <Outlet 
      context={{ 
        user, 
        organizations, 
        currentOrg, 
        setCurrentOrg, 
        refreshOrganizations: fetchOrgs 
      }} 
    />
  );
}

