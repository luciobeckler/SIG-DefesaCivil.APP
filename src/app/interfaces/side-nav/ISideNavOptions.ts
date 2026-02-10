// Tente usar ../ até chegar na pasta auth
import { EPermission } from '../../auth/permissions.enum';

export interface ISideNavOptions {
  icon: string;
  title: string;
  permission?: EPermission;
  path: string;
}

export interface ISideNavSection {
  title: string;
  sideNavOptions: ISideNavOptions[];
}

export interface ISideNav {
  icon: string;
  title: string;
  subTitle: string;
  sections: ISideNavSection[];
}
