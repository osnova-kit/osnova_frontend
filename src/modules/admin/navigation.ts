import {
  BellOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  FileOutlined,
  GlobalOutlined,
  HistoryOutlined,
  InboxOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
  SendOutlined,
  SettingOutlined,
  TeamOutlined,
  TranslationOutlined,
  UserSwitchOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';

import type { NavItem } from '../../config/navigation';

export const adminNavItems: NavItem[] = [
  { path: '/admin', label: 'pages.overview', icon: DashboardOutlined },
  { path: '/admin/users', label: 'pages.users', icon: TeamOutlined, permission: 'users.read' },
  { path: '/admin/leads', label: 'pages.leads', icon: InboxOutlined, permission: 'leads.read' },
  {
    path: 'access',
    label: 'pages.access',
    icon: SafetyOutlined,
    children: [
      { path: '/admin/roles', label: 'pages.roles', icon: UserSwitchOutlined },
      { path: '/admin/groups', label: 'pages.groups', icon: UsergroupAddOutlined },
      {
        path: '/admin/audit',
        label: 'pages.audit',
        icon: HistoryOutlined,
        permission: 'audit.read',
      },
    ],
  },
  {
    path: 'settings',
    label: 'pages.settings',
    icon: SettingOutlined,
    children: [
      { path: '/admin/settings/site', label: 'pages.settingsSite', icon: GlobalOutlined },
      {
        path: '/admin/settings/languages',
        label: 'pages.settingsLanguages',
        icon: TranslationOutlined,
      },
      {
        path: '/admin/settings/mail',
        label: 'pages.settingsMail',
        icon: MailOutlined,
        permission: 'settings.mail',
      },
      {
        path: '/admin/settings/protection',
        label: 'pages.settingsProtection',
        icon: LockOutlined,
        permission: 'settings.protection',
      },
      {
        path: '/admin/settings/retention',
        label: 'pages.settingsRetention',
        icon: FieldTimeOutlined,
      },
      {
        path: '/admin/settings/files',
        label: 'pages.settingsFiles',
        icon: FileOutlined,
        capability: 'files',
      },
      {
        path: '/admin/settings/notifications',
        label: 'pages.settingsNotifications',
        icon: BellOutlined,
        capability: 'notifications',
      },
      { path: '/admin/settings/channels', label: 'pages.channels', icon: SendOutlined },
    ],
  },
];
