import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { getOrganizations } from '../api/organization';
import { getMyAccess } from '../api/access';
import { recordAuditEvent } from '../api/audit';
import AccessExpiredBanner from './AccessExpiredBanner';
import RequestAccessModal from './RequestAccessModal';

export default function ProtectedDashboard() {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
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

  // Record a one-time auth.login audit event once we have an org context.
  // The flag is set by the Login page so this fires on a real login, not every mount.
  useEffect(() => {
    if (!currentOrg?.id) return;
    if (sessionStorage.getItem('loglogic_pending_login_audit') !== '1') return;
    sessionStorage.removeItem('loglogic_pending_login_audit');
    recordAuditEvent(currentOrg.id, 'auth.login').catch(() => {});
  }, [currentOrg?.id]);

  const fetchAccessStatus = useCallback(async (orgId) => {
    if (!orgId) {
      setAccessStatus(null);
      return;
    }
    try {
      const statusData = await getMyAccess(orgId);
      setAccessStatus(statusData);
    } catch (err) {
      console.error("Error fetching access status:", err);
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

      // If the user has no workspace but arrived with a pending invite,
      // route them to accept it instead of forcing a personal workspace.
      // Accepting an invite counts as onboarding.
      const pendingInvite = localStorage.getItem('loglogic_pending_invite');

      if (!hasOrg && pendingInvite && location.pathname !== '/app/onboarding') {
        navigate(`/invite?token=${encodeURIComponent(pendingInvite)}`);
        return;
      }

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

  // Whenever the active workspace changes, check its detailed access status
  useEffect(() => {
    if (currentOrg?.id) {
      fetchAccessStatus(currentOrg.id);
    }
  }, [currentOrg?.id, fetchAccessStatus]);

  // An active workspace is considered expired if either the organization list
  // or the direct status check flags it as expired.
  const isAccessExpired = Boolean(
    currentOrg?.isExpired ||
    accessStatus?.membership?.expired
  );

  const latestRequest = accessStatus?.request || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center font-mono text-primary">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <span>[VERIFYING WORKSPACE STATUS...]</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* Expired Access Alert Bar (shows across all app views when expired) */}
      {isAccessExpired && (
        <AccessExpiredBanner
          orgName={currentOrg?.name || 'Workspace'}
          accessExpiresAt={currentOrg?.accessExpiresAt || accessStatus?.membership?.accessExpiresAt}
          latestRequest={latestRequest}
          onRequestAccess={() => setRequestModalOpen(true)}
        />
      )}

      {/* Request Access Modal */}
      <RequestAccessModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        orgId={currentOrg?.id}
        orgName={currentOrg?.name}
        userEmail={user?.email}
        currentRole={currentOrg?.role}
        onSubmitted={() => {
          if (currentOrg?.id) fetchAccessStatus(currentOrg.id);
        }}
      />

      <div className="flex-1 min-h-0 flex flex-col">
        <Outlet 
          context={{ 
            user, 
            organizations, 
            currentOrg, 
            setCurrentOrg, 
            refreshOrganizations: fetchOrgs,
            isAccessExpired,
            accessStatus,
            latestRequest,
            openRequestAccess: () => setRequestModalOpen(true),
            refreshAccessStatus: () => {
              if (currentOrg?.id) fetchAccessStatus(currentOrg.id);
            }
          }} 
        />
      </div>
    </div>
  );
}


