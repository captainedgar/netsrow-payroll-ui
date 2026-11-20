/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import {
  NetsRowPayrollWorkspace,
  PayrollWorkspaceProvider,
} from './netsrow-payroll';
import { MockPayrollClient } from './netsrow-payroll/services/mockPayrollClient';

export default function App() {
  // Isolated simulated backend client (replace with NetsRow HTTP client in apps/web)
  const mockClient = useMemo(() => new MockPayrollClient(200), []);

  return (
    <PayrollWorkspaceProvider
      apiClient={mockClient}
      enableDemoRoleControl={true}
      initialScreen="payroll_review"
      initialLocale="es"
      initialTheme="light"
    >
      <NetsRowPayrollWorkspace />
    </PayrollWorkspaceProvider>
  );
}
