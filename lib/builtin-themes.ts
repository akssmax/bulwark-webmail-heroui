import type { InstalledTheme } from './plugin-types';

const quiCSS = `
:root {
  --color-border: oklch(0.9197 0.004 286.32);
  --color-input: oklch(0.9197 0.004 286.32);
  --color-ring: oklch(0.6231 0.188 259.81);
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.1408 0.0044 285.82);
  --color-primary: oklch(0.6231 0.188 259.81);
  --color-primary-foreground: oklch(1 0 0);
  --color-secondary: oklch(0.9674 0.0013 286.38);
  --color-secondary-foreground: oklch(0.2103 0.0059 285.89);
  --color-muted: oklch(0.9674 0.0013 286.38);
  --color-muted-foreground: oklch(0.5517 0.0138 285.94);
  --color-accent: oklch(0.9319 0.0316 255.59);
  --color-accent-foreground: oklch(0.4882 0.2172 264.38);
  --color-destructive: oklch(0.6368 0.2078 25.33);
  --color-destructive-foreground: oklch(1 0 0);
  --color-popover: oklch(1 0 0);
  --color-popover-foreground: oklch(0.1408 0.0044 285.82);
  --color-sidebar: oklch(0.9851 0 0);
  --color-sidebar-foreground: oklch(0.1408 0.0044 285.82);
  --color-sidebar-border: oklch(0.9197 0.004 286.32);
  --color-sidebar-accent: oklch(0.9674 0.0013 286.38);
  --color-sidebar-accent-foreground: oklch(0.2103 0.0059 285.89);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.1408 0.0044 285.82);
  --color-success: oklch(0.7227 0.192 149.58);
  --color-success-foreground: oklch(1 0 0);
  --color-warning: oklch(0.7952 0.1617 86.05);
  --color-warning-foreground: oklch(1 0 0);
  --color-info: oklch(0.6231 0.188 259.81);
  --color-info-foreground: oklch(1 0 0);
  --color-selection: oklch(0.9319 0.0316 255.59);
  --color-selection-foreground: oklch(0.4882 0.2172 264.38);
  --color-unread: oklch(0.6231 0.188 259.81);
  --color-chart-1: oklch(0.6231 0.188 259.81);
  --color-chart-2: oklch(0.7227 0.192 149.58);
  --color-chart-3: oklch(0.7686 0.1647 70.08);
  --color-chart-4: oklch(0.6368 0.2078 25.33);
  --color-chart-5: oklch(0.6056 0.2189 292.72);
}
.dark {
  --color-border: oklch(0.2739 0.0055 286.03);
  --color-input: oklch(0.2739 0.0055 286.03);
  --color-ring: oklch(0.6231 0.188 259.81);
  --color-background: oklch(0.1408 0.0044 285.82);
  --color-foreground: oklch(0.9851 0 0);
  --color-primary: oklch(0.6231 0.188 259.81);
  --color-primary-foreground: oklch(1 0 0);
  --color-secondary: oklch(0.2103 0.0059 285.89);
  --color-secondary-foreground: oklch(0.9851 0 0);
  --color-muted: oklch(0.2103 0.0059 285.89);
  --color-muted-foreground: oklch(0.7118 0.0129 286.07);
  --color-accent: oklch(0.2823 0.0874 267.94);
  --color-accent-foreground: oklch(0.8091 0.0956 251.81);
  --color-destructive: oklch(0.6368 0.2078 25.33);
  --color-destructive-foreground: oklch(0.9851 0 0);
  --color-popover: oklch(0.2103 0.0059 285.89);
  --color-popover-foreground: oklch(0.9851 0 0);
  --color-sidebar: oklch(0.1408 0.0044 285.82);
  --color-sidebar-foreground: oklch(0.9851 0 0);
  --color-sidebar-border: oklch(0.2739 0.0055 286.03);
  --color-sidebar-accent: oklch(0.2103 0.0059 285.89);
  --color-sidebar-accent-foreground: oklch(0.9851 0 0);
  --color-card: oklch(0.1913 0 0);
  --color-card-foreground: oklch(0.9851 0 0);
  --color-success: oklch(0.6271 0.1699 149.21);
  --color-success-foreground: oklch(1 0 0);
  --color-warning: oklch(0.6806 0.1423 75.83);
  --color-warning-foreground: oklch(1 0 0);
  --color-info: oklch(0.7137 0.1434 254.62);
  --color-info-foreground: oklch(1 0 0);
  --color-selection: oklch(0.6231 0.188 259.81 / 0.25);
  --color-selection-foreground: oklch(0.8091 0.0956 251.81);
  --color-unread: oklch(0.7137 0.1434 254.62);
  --color-chart-1: oklch(0.7137 0.1434 254.62);
  --color-chart-2: oklch(0.8003 0.1821 151.71);
  --color-chart-3: oklch(0.8369 0.1644 84.43);
  --color-chart-4: oklch(0.7106 0.1661 22.22);
  --color-chart-5: oklch(0.709 0.1592 293.54);
}`;

const nordCSS = `
:root {
  --color-border: oklch(0.8993 0.0164 262.75);
  --color-input: oklch(0.8993 0.0164 262.75);
  --color-ring: oklch(0.6965 0.0591 248.69);
  --color-background: oklch(0.9513 0.0074 260.73);
  --color-foreground: oklch(0.3244 0.0229 264.18);
  --color-primary: oklch(0.5944 0.0772 254.03);
  --color-primary-foreground: oklch(0.9513 0.0074 260.73);
  --color-secondary: oklch(0.933 0.0104 261.79);
  --color-secondary-foreground: oklch(0.3244 0.0229 264.18);
  --color-muted: oklch(0.8993 0.0164 262.75);
  --color-muted-foreground: oklch(0.4523 0.0352 264.13);
  --color-accent: oklch(0.6965 0.0591 248.69);
  --color-accent-foreground: oklch(0.3244 0.0229 264.18);
  --color-destructive: oklch(0.6061 0.1206 15.34);
  --color-destructive-foreground: oklch(0.9513 0.0074 260.73);
  --color-popover: oklch(0.9513 0.0074 260.73);
  --color-popover-foreground: oklch(0.3244 0.0229 264.18);
  --color-sidebar: oklch(0.933 0.0104 261.79);
  --color-sidebar-foreground: oklch(0.3244 0.0229 264.18);
  --color-sidebar-border: oklch(0.8993 0.0164 262.75);
  --color-sidebar-accent: oklch(0.8993 0.0164 262.75);
  --color-sidebar-accent-foreground: oklch(0.3244 0.0229 264.18);
  --color-card: oklch(0.9513 0.0074 260.73);
  --color-card-foreground: oklch(0.3244 0.0229 264.18);
  --color-success: oklch(0.7683 0.0749 131.06);
  --color-success-foreground: oklch(0.3244 0.0229 264.18);
  --color-warning: oklch(0.8549 0.0892 84.09);
  --color-warning-foreground: oklch(0.3244 0.0229 264.18);
  --color-info: oklch(0.6965 0.0591 248.69);
  --color-info-foreground: oklch(0.9513 0.0074 260.73);
  --color-selection: oklch(0.8993 0.0164 262.75);
  --color-selection-foreground: oklch(0.5944 0.0772 254.03);
  --color-unread: oklch(0.5944 0.0772 254.03);
  --color-chart-1: oklch(0.5944 0.0772 254.03);
  --color-chart-2: oklch(0.7683 0.0749 131.06);
  --color-chart-3: oklch(0.8549 0.0892 84.09);
  --color-chart-4: oklch(0.6061 0.1206 15.34);
  --color-chart-5: oklch(0.6921 0.0625 332.66);
}
.dark {
  --color-border: oklch(0.3792 0.029 266.47);
  --color-input: oklch(0.3792 0.029 266.47);
  --color-ring: oklch(0.7746 0.0622 217.47);
  --color-background: oklch(0.3244 0.0229 264.18);
  --color-foreground: oklch(0.9513 0.0074 260.73);
  --color-primary: oklch(0.7746 0.0622 217.47);
  --color-primary-foreground: oklch(0.3244 0.0229 264.18);
  --color-secondary: oklch(0.3792 0.029 266.47);
  --color-secondary-foreground: oklch(0.9513 0.0074 260.73);
  --color-muted: oklch(0.3792 0.029 266.47);
  --color-muted-foreground: oklch(0.8993 0.0164 262.75);
  --color-accent: oklch(0.4157 0.0324 264.13);
  --color-accent-foreground: oklch(0.7746 0.0622 217.47);
  --color-destructive: oklch(0.6061 0.1206 15.34);
  --color-destructive-foreground: oklch(0.9513 0.0074 260.73);
  --color-popover: oklch(0.3792 0.029 266.47);
  --color-popover-foreground: oklch(0.9513 0.0074 260.73);
  --color-sidebar: oklch(0.3244 0.0229 264.18);
  --color-sidebar-foreground: oklch(0.9513 0.0074 260.73);
  --color-sidebar-border: oklch(0.3792 0.029 266.47);
  --color-sidebar-accent: oklch(0.3792 0.029 266.47);
  --color-sidebar-accent-foreground: oklch(0.9513 0.0074 260.73);
  --color-card: oklch(0.3792 0.029 266.47);
  --color-card-foreground: oklch(0.9513 0.0074 260.73);
  --color-success: oklch(0.7683 0.0749 131.06);
  --color-success-foreground: oklch(0.3244 0.0229 264.18);
  --color-warning: oklch(0.8549 0.0892 84.09);
  --color-warning-foreground: oklch(0.3244 0.0229 264.18);
  --color-info: oklch(0.7746 0.0622 217.47);
  --color-info-foreground: oklch(0.3244 0.0229 264.18);
  --color-selection: oklch(0.7746 0.0622 217.47 / 0.2);
  --color-selection-foreground: oklch(0.7746 0.0622 217.47);
  --color-unread: oklch(0.7746 0.0622 217.47);
  --color-chart-1: oklch(0.7746 0.0622 217.47);
  --color-chart-2: oklch(0.7683 0.0749 131.06);
  --color-chart-3: oklch(0.8549 0.0892 84.09);
  --color-chart-4: oklch(0.6061 0.1206 15.34);
  --color-chart-5: oklch(0.6921 0.0625 332.66);
}`;

const catppuccinCSS = `
:root {
  --color-border: oklch(0.8575 0.0145 268.48);
  --color-input: oklch(0.8575 0.0145 268.48);
  --color-ring: oklch(0.5547 0.2503 297.02);
  --color-background: oklch(0.9578 0.0058 264.53);
  --color-foreground: oklch(0.4355 0.043 279.33);
  --color-primary: oklch(0.5547 0.2503 297.02);
  --color-primary-foreground: oklch(0.9578 0.0058 264.53);
  --color-secondary: oklch(0.9335 0.0087 264.52);
  --color-secondary-foreground: oklch(0.4355 0.043 279.33);
  --color-muted: oklch(0.906 0.0117 264.51);
  --color-muted-foreground: oklch(0.5471 0.0343 279.08);
  --color-accent: oklch(0.5547 0.2503 297.02);
  --color-accent-foreground: oklch(0.9578 0.0058 264.53);
  --color-destructive: oklch(0.5505 0.2155 19.81);
  --color-destructive-foreground: oklch(0.9578 0.0058 264.53);
  --color-popover: oklch(0.9578 0.0058 264.53);
  --color-popover-foreground: oklch(0.4355 0.043 279.33);
  --color-sidebar: oklch(0.9335 0.0087 264.52);
  --color-sidebar-foreground: oklch(0.4355 0.043 279.33);
  --color-sidebar-border: oklch(0.8575 0.0145 268.48);
  --color-sidebar-accent: oklch(0.906 0.0117 264.51);
  --color-sidebar-accent-foreground: oklch(0.4355 0.043 279.33);
  --color-card: oklch(0.9578 0.0058 264.53);
  --color-card-foreground: oklch(0.4355 0.043 279.33);
  --color-success: oklch(0.625 0.1772 140.44);
  --color-success-foreground: oklch(0.9578 0.0058 264.53);
  --color-warning: oklch(0.714 0.1494 67.78);
  --color-warning-foreground: oklch(0.9578 0.0058 264.53);
  --color-info: oklch(0.5586 0.2255 262.09);
  --color-info-foreground: oklch(0.9578 0.0058 264.53);
  --color-selection: oklch(0.906 0.0117 264.51);
  --color-selection-foreground: oklch(0.5547 0.2503 297.02);
  --color-unread: oklch(0.5547 0.2503 297.02);
  --color-chart-1: oklch(0.5547 0.2503 297.02);
  --color-chart-2: oklch(0.625 0.1772 140.44);
  --color-chart-3: oklch(0.714 0.1494 67.78);
  --color-chart-4: oklch(0.5505 0.2155 19.81);
  --color-chart-5: oklch(0.5586 0.2255 262.09);
}
.dark {
  --color-border: oklch(0.4037 0.032 280.15);
  --color-input: oklch(0.4037 0.032 280.15);
  --color-ring: oklch(0.7871 0.1187 304.77);
  --color-background: oklch(0.2429 0.0304 283.91);
  --color-foreground: oklch(0.8787 0.0426 272.28);
  --color-primary: oklch(0.7871 0.1187 304.77);
  --color-primary-foreground: oklch(0.2429 0.0304 283.91);
  --color-secondary: oklch(0.324 0.0319 281.98);
  --color-secondary-foreground: oklch(0.8787 0.0426 272.28);
  --color-muted: oklch(0.324 0.0319 281.98);
  --color-muted-foreground: oklch(0.751 0.0396 273.93);
  --color-accent: oklch(0.4037 0.032 280.15);
  --color-accent-foreground: oklch(0.7871 0.1187 304.77);
  --color-destructive: oklch(0.7556 0.1297 2.76);
  --color-destructive-foreground: oklch(0.2429 0.0304 283.91);
  --color-popover: oklch(0.324 0.0319 281.98);
  --color-popover-foreground: oklch(0.8787 0.0426 272.28);
  --color-sidebar: oklch(0.2429 0.0304 283.91);
  --color-sidebar-foreground: oklch(0.8787 0.0426 272.28);
  --color-sidebar-border: oklch(0.4037 0.032 280.15);
  --color-sidebar-accent: oklch(0.324 0.0319 281.98);
  --color-sidebar-accent-foreground: oklch(0.8787 0.0426 272.28);
  --color-card: oklch(0.324 0.0319 281.98);
  --color-card-foreground: oklch(0.8787 0.0426 272.28);
  --color-success: oklch(0.8577 0.1092 142.72);
  --color-success-foreground: oklch(0.2429 0.0304 283.91);
  --color-warning: oklch(0.9193 0.0704 86.53);
  --color-warning-foreground: oklch(0.2429 0.0304 283.91);
  --color-info: oklch(0.7664 0.1113 259.88);
  --color-info-foreground: oklch(0.2429 0.0304 283.91);
  --color-selection: oklch(0.7871 0.1187 304.77 / 0.2);
  --color-selection-foreground: oklch(0.7871 0.1187 304.77);
  --color-unread: oklch(0.7871 0.1187 304.77);
  --color-chart-1: oklch(0.7871 0.1187 304.77);
  --color-chart-2: oklch(0.8577 0.1092 142.72);
  --color-chart-3: oklch(0.9193 0.0704 86.53);
  --color-chart-4: oklch(0.7556 0.1297 2.76);
  --color-chart-5: oklch(0.7664 0.1113 259.88);
}`;

const solarizedCSS = `
:root {
  --color-border: oklch(0.9306 0.026 92.4);
  --color-input: oklch(0.9306 0.026 92.4);
  --color-ring: oklch(0.6149 0.1394 244.93);
  --color-background: oklch(0.9735 0.0261 90.1);
  --color-foreground: oklch(0.5682 0.0285 221.9);
  --color-primary: oklch(0.6149 0.1394 244.93);
  --color-primary-foreground: oklch(0.9735 0.0261 90.1);
  --color-secondary: oklch(0.9306 0.026 92.4);
  --color-secondary-foreground: oklch(0.523 0.0283 219.14);
  --color-muted: oklch(0.9306 0.026 92.4);
  --color-muted-foreground: oklch(0.6979 0.0159 196.79);
  --color-accent: oklch(0.6149 0.1394 244.93);
  --color-accent-foreground: oklch(0.9735 0.0261 90.1);
  --color-destructive: oklch(0.5863 0.2064 27.12);
  --color-destructive-foreground: oklch(0.9735 0.0261 90.1);
  --color-popover: oklch(0.9735 0.0261 90.1);
  --color-popover-foreground: oklch(0.5682 0.0285 221.9);
  --color-sidebar: oklch(0.9306 0.026 92.4);
  --color-sidebar-foreground: oklch(0.5682 0.0285 221.9);
  --color-sidebar-border: oklch(0.9306 0.026 92.4);
  --color-sidebar-accent: oklch(0.9306 0.026 92.4);
  --color-sidebar-accent-foreground: oklch(0.523 0.0283 219.14);
  --color-card: oklch(0.9735 0.0261 90.1);
  --color-card-foreground: oklch(0.5682 0.0285 221.9);
  --color-success: oklch(0.6444 0.1508 118.6);
  --color-success-foreground: oklch(0.9735 0.0261 90.1);
  --color-warning: oklch(0.6545 0.134 85.72);
  --color-warning-foreground: oklch(0.9735 0.0261 90.1);
  --color-info: oklch(0.6149 0.1394 244.93);
  --color-info-foreground: oklch(0.9735 0.0261 90.1);
  --color-selection: oklch(0.9306 0.026 92.4);
  --color-selection-foreground: oklch(0.6149 0.1394 244.93);
  --color-unread: oklch(0.6149 0.1394 244.93);
  --color-chart-1: oklch(0.6149 0.1394 244.93);
  --color-chart-2: oklch(0.6444 0.1508 118.6);
  --color-chart-3: oklch(0.6545 0.134 85.72);
  --color-chart-4: oklch(0.5863 0.2064 27.12);
  --color-chart-5: oklch(0.5823 0.1261 279.1);
}
.dark {
  --color-border: oklch(0.3092 0.0518 219.65);
  --color-input: oklch(0.3092 0.0518 219.65);
  --color-ring: oklch(0.6149 0.1394 244.93);
  --color-background: oklch(0.2673 0.0486 219.82);
  --color-foreground: oklch(0.6537 0.0197 205.26);
  --color-primary: oklch(0.6149 0.1394 244.93);
  --color-primary-foreground: oklch(0.2673 0.0486 219.82);
  --color-secondary: oklch(0.3092 0.0518 219.65);
  --color-secondary-foreground: oklch(0.6979 0.0159 196.79);
  --color-muted: oklch(0.3092 0.0518 219.65);
  --color-muted-foreground: oklch(0.523 0.0283 219.14);
  --color-accent: oklch(0.3092 0.0518 219.65);
  --color-accent-foreground: oklch(0.6149 0.1394 244.93);
  --color-destructive: oklch(0.5863 0.2064 27.12);
  --color-destructive-foreground: oklch(0.9735 0.0261 90.1);
  --color-popover: oklch(0.3092 0.0518 219.65);
  --color-popover-foreground: oklch(0.6979 0.0159 196.79);
  --color-sidebar: oklch(0.2673 0.0486 219.82);
  --color-sidebar-foreground: oklch(0.6537 0.0197 205.26);
  --color-sidebar-border: oklch(0.3092 0.0518 219.65);
  --color-sidebar-accent: oklch(0.3092 0.0518 219.65);
  --color-sidebar-accent-foreground: oklch(0.6979 0.0159 196.79);
  --color-card: oklch(0.3092 0.0518 219.65);
  --color-card-foreground: oklch(0.6979 0.0159 196.79);
  --color-success: oklch(0.6444 0.1508 118.6);
  --color-success-foreground: oklch(0.2673 0.0486 219.82);
  --color-warning: oklch(0.6545 0.134 85.72);
  --color-warning-foreground: oklch(0.2673 0.0486 219.82);
  --color-info: oklch(0.6149 0.1394 244.93);
  --color-info-foreground: oklch(0.2673 0.0486 219.82);
  --color-selection: oklch(0.6149 0.1394 244.93 / 0.2);
  --color-selection-foreground: oklch(0.6149 0.1394 244.93);
  --color-unread: oklch(0.6149 0.1394 244.93);
  --color-chart-1: oklch(0.6149 0.1394 244.93);
  --color-chart-2: oklch(0.6444 0.1508 118.6);
  --color-chart-3: oklch(0.6545 0.134 85.72);
  --color-chart-4: oklch(0.5863 0.2064 27.12);
  --color-chart-5: oklch(0.5823 0.1261 279.1);
}`;

// Roundcube "Elastic" skin recreation.
//
// Colour tokens are lifted from skins/elastic/styles/colors.less (CC BY-SA):
//   accent      #37beff   font        #27353a   border  #ddd
//   error       #ff5552   success     #41b849   warning #ffd452
//   task-menu    #2f3a3f (always dark, both modes)
//   list-select  tint(#37beff, 90%) -> #ebf8ff
// Dark mode mirrors @color-dark-* (background #21292c, font #c5d1d3, …).
const elasticCSS = `
:root {
  --color-border: oklch(0.8975 0 0);
  --color-input: oklch(0.8671 0.0106 247.95);
  --color-ring: oklch(0.7589 0.1451 234.99);
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.3185 0.0206 221.76);
  --color-primary: oklch(0.7589 0.1451 234.99);
  --color-primary-foreground: oklch(1 0 0);
  --color-secondary: oklch(0.9672 0 0);
  --color-secondary-foreground: oklch(0.3185 0.0206 221.76);
  --color-muted: oklch(0.9672 0 0);
  --color-muted-foreground: oklch(0.5636 0.004 219.56);
  --color-accent: oklch(0.9639 0.0208 232.12);
  --color-accent-foreground: oklch(0.5211 0.1215 241.04);
  --color-destructive: oklch(0.6818 0.2067 25.35);
  --color-destructive-foreground: oklch(1 0 0);
  --color-popover: oklch(1 0 0);
  --color-popover-foreground: oklch(0.3185 0.0206 221.76);
  --color-sidebar: oklch(1 0 0);
  --color-sidebar-foreground: oklch(0.3185 0.0206 221.76);
  --color-sidebar-border: oklch(0.8975 0 0);
  --color-sidebar-accent: oklch(0.9715 0.0167 230.9);
  --color-sidebar-accent-foreground: oklch(0.3185 0.0206 221.76);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.3185 0.0206 221.76);
  --color-success: oklch(0.6922 0.1847 144.29);
  --color-success-foreground: oklch(1 0 0);
  --color-warning: oklch(0.8842 0.1513 90.4);
  --color-warning-foreground: oklch(0.3185 0.0206 221.76);
  --color-info: oklch(0.7589 0.1451 234.99);
  --color-info-foreground: oklch(1 0 0);
  --color-selection: oklch(0.9715 0.0167 230.9);
  --color-selection-foreground: oklch(0.3185 0.0206 221.76);
  --color-unread: oklch(0.8842 0.1513 90.4);
  --color-chart-1: oklch(0.7589 0.1451 234.99);
  --color-chart-2: oklch(0.6922 0.1847 144.29);
  --color-chart-3: oklch(0.8842 0.1513 90.4);
  --color-chart-4: oklch(0.6818 0.2067 25.35);
  --color-chart-5: oklch(0.5772 0.1525 315.32);
  /* Elastic is a 14px Roboto skin with tighter list rows than Bulwark's default */
  --font-size-base: 14px;
  --list-item-height: 40px;
}
.dark {
  --color-border: oklch(0.4755 0.025 218.96);
  --color-input: oklch(0.4755 0.025 218.96);
  --color-ring: oklch(0.7589 0.1451 234.99);
  --color-background: oklch(0.2745 0.0126 222.51);
  --color-foreground: oklch(1 0 0);
  --color-primary: oklch(0.7589 0.1451 234.99);
  --color-primary-foreground: oklch(1 0 0);
  --color-secondary: oklch(0.3279 0.0157 216.1);
  --color-secondary-foreground: oklch(1 0 0);
  --color-muted: oklch(0.3279 0.0157 216.1);
  /* Roundcube keeps most text near the bright font colour, only true hints
     dim out. Bulwark applies muted-foreground far more widely, so brighten it
     toward @color-dark-font (#c5d1d3) to match Elastic's overall brightness. */
  --color-muted-foreground: oklch(0.7939 0.0129 215.84);
  --color-accent: oklch(0.3797 0.0193 216.99);
  --color-accent-foreground: oklch(0.7589 0.1451 234.99);
  --color-destructive: oklch(0.6818 0.2067 25.35);
  --color-destructive-foreground: oklch(1 0 0);
  --color-popover: oklch(0.2178 0.0085 223.87);
  --color-popover-foreground: oklch(1 0 0);
  --color-sidebar: oklch(0.2745 0.0126 222.51);
  --color-sidebar-foreground: oklch(1 0 0);
  --color-sidebar-border: oklch(0.4755 0.025 218.96);
  --color-sidebar-accent: oklch(0.3797 0.0193 216.99);
  --color-sidebar-accent-foreground: oklch(0.8521 0.0134 208.76);
  --color-card: oklch(0.2454 0.0128 222.62);
  --color-card-foreground: oklch(1 0 0);
  --color-success: oklch(0.6922 0.1847 144.29);
  --color-success-foreground: oklch(1 0 0);
  --color-warning: oklch(0.8842 0.1513 90.4);
  --color-warning-foreground: oklch(0.2745 0.0126 222.51);
  --color-info: oklch(0.7589 0.1451 234.99);
  --color-info-foreground: oklch(1 0 0);
  --color-selection: oklch(0.3797 0.0193 216.99);
  --color-selection-foreground: oklch(0.7589 0.1451 234.99);
  --color-unread: oklch(0.6598 0.1353 84.83);
  --color-chart-1: oklch(0.7589 0.1451 234.99);
  --color-chart-2: oklch(0.6922 0.1847 144.29);
  --color-chart-3: oklch(0.8842 0.1513 90.4);
  --color-chart-4: oklch(0.6818 0.2067 25.35);
  --color-chart-5: oklch(0.6921 0.0625 332.66);
}`;

// Component-level overrides that the colour tokens alone can't express:
// Roboto typography and Elastic's signature dark "task menu" rail (which is
// dark in both light and dark mode). Scoped under the skin body attribute so
// it cleanly detaches when the theme is switched off.
const elasticSkin = `
body[data-theme-skin="builtin-roundcube-elastic"] {
  font-family: Roboto, "Helvetica Neue", "Segoe UI", Arial, "Noto Sans", sans-serif;
}

/* ── Task menu (left navigation rail) ─────────────────────────── */
body[data-theme-skin="builtin-roundcube-elastic"] .w-14.bg-secondary {
  background-color: #2f3a3f !important;
  border-right: 1px solid rgba(0, 0, 0, 0.25) !important;
}
/* In dark mode the black hairline vanishes against the dark canvas - use a
   light one so the rail still reads as a distinct column. (.dark lives on
   <html>, so it must be an ancestor of the skinned <body>.) */
.dark body[data-theme-skin="builtin-roundcube-elastic"] .w-14.bg-secondary {
  border-right-color: rgba(255, 255, 255, 0.1) !important;
}
/* Light icons + labels on the dark rail */
body[data-theme-skin="builtin-roundcube-elastic"] .w-14.bg-secondary a,
body[data-theme-skin="builtin-roundcube-elastic"] .w-14.bg-secondary button,
body[data-theme-skin="builtin-roundcube-elastic"] .w-14.bg-secondary .text-muted-foreground {
  color: #e7edee !important;
}
/* Hover slab */
body[data-theme-skin="builtin-roundcube-elastic"] .w-14.bg-secondary a:hover,
body[data-theme-skin="builtin-roundcube-elastic"] .w-14.bg-secondary button:hover {
  background-color: #41525a !important;
  color: #ffffff !important;
}
/* Selected task: brighter slab, accent-blue glyph (matches Elastic) */
body[data-theme-skin="builtin-roundcube-elastic"] .w-14.bg-secondary .bg-primary\\/10 {
  background-color: #41525a !important;
}
body[data-theme-skin="builtin-roundcube-elastic"] .w-14.bg-secondary .text-primary {
  color: #37beff !important;
}

/* ── Flatten Bulwark's soft radii to Elastic's Bootstrap-flat look ── */
/* Elastic uses ~4px corners on buttons/inputs/cards; rounded-full (pills,
   avatars, toggles) is intentionally left alone. */
body[data-theme-skin="builtin-roundcube-elastic"] .rounded-md,
body[data-theme-skin="builtin-roundcube-elastic"] .rounded-lg,
body[data-theme-skin="builtin-roundcube-elastic"] .rounded-xl,
body[data-theme-skin="builtin-roundcube-elastic"] .rounded-2xl,
body[data-theme-skin="builtin-roundcube-elastic"] .rounded-3xl,
body[data-theme-skin="builtin-roundcube-elastic"] input,
body[data-theme-skin="builtin-roundcube-elastic"] textarea,
body[data-theme-skin="builtin-roundcube-elastic"] button:not(.rounded-full) {
  border-radius: 4px !important;
}

/* ── Unify panel backgrounds like Roundcube ───────────────────── */
/* In Elastic the folder list, message list and content pane all share one
   canvas (white / dark); only the narrow task rail is dark. Bulwark's folder
   sidebar uses \`bg-secondary\` (a grey panel), so repaint it with the main
   background. The folder sidebar carries the \`border-r\` class; the dark task
   rail uses \`bg-secondary\` WITHOUT it (inline-styled border), so this
   qualifier leaves the rail dark. */
body[data-theme-skin="builtin-roundcube-elastic"] .bg-secondary.border-r {
  background-color: var(--color-background) !important;
}
/* The empty "No conversation selected" pane uses a muted diagonal gradient;
   flatten it to the plain canvas so the content area is one solid colour. */
body[data-theme-skin="builtin-roundcube-elastic"] .bg-gradient-to-br.from-muted\\/30.to-muted\\/50 {
  background: var(--color-background) !important;
}

/* The message-viewer body sits on a faint muted backing (bg-muted/30); flatten
   it to the plain canvas so the whole content pane - search bar, action
   toolbar, mail header and body - is one uniform background colour. The
   search/toolbar/header are bordered \`bg-background\` strips, so they already
   match once we leave them untinted. */
body[data-theme-skin="builtin-roundcube-elastic"] .bg-muted\\/30 {
  background-color: var(--color-background) !important;
}

/* ── Elastic primary buttons (.btn-primary) ──────────────────── */
/* Solid accent fill, white label + icon, hairline border, focus halo. Light
   = @color-main (#37beff); dark = @color-dark-main (darken 30% -> #006a9d)
   with the bright #37beff outline, exactly like the on-switch. */
body[data-theme-skin="builtin-roundcube-elastic"] .bg-primary.text-primary-foreground {
  background-color: #37beff !important;
  border: 1px solid #37beff !important;
  color: #ffffff !important;
}
body[data-theme-skin="builtin-roundcube-elastic"] .bg-primary.text-primary-foreground:hover {
  background-color: #19b6fe !important;
  border-color: #0bb0ff !important;
}
body[data-theme-skin="builtin-roundcube-elastic"] .bg-primary.text-primary-foreground:focus-visible {
  box-shadow: 0 0 0 0.2rem rgba(55, 190, 255, 0.3) !important;
}
.dark body[data-theme-skin="builtin-roundcube-elastic"] .bg-primary.text-primary-foreground {
  background-color: #006a9d !important;
  border-color: #37beff !important;
  color: #ffffff !important;
}
.dark body[data-theme-skin="builtin-roundcube-elastic"] .bg-primary.text-primary-foreground:hover {
  background-color: #0079b3 !important;
}

/* ── Elastic on/off switch (.custom-switch) ──────────────────── */
/* Track + knob restyled to the Bootstrap-derived Elastic switch. The toggle
   is a [role="switch"] button with a single inner <span> knob. */
body[data-theme-skin="builtin-roundcube-elastic"] [role="switch"] {
  background-color: #ced4da !important;
  border: 1px solid #b8c0c8 !important;
}
body[data-theme-skin="builtin-roundcube-elastic"] [role="switch"] > span {
  background-color: #ffffff !important;
}
body[data-theme-skin="builtin-roundcube-elastic"] [role="switch"][aria-checked="true"] {
  background-color: #37beff !important;
  border-color: #37beff !important;
}
.dark body[data-theme-skin="builtin-roundcube-elastic"] [role="switch"] {
  background-color: #4d6066 !important;
  border-color: #5d7077 !important;
}
.dark body[data-theme-skin="builtin-roundcube-elastic"] [role="switch"] > span {
  background-color: #c5d1d3 !important;
}
.dark body[data-theme-skin="builtin-roundcube-elastic"] [role="switch"][aria-checked="true"] {
  background-color: #006a9d !important;
  border-color: #37beff !important;
}

/* ── Recipient name/email rendered as links (like Roundcube) ──── */
/* Sender + recipient triggers (RecipientPopover) sit at \`text-foreground\`
   and only turn blue on hover; Elastic shows them link-blue at rest
   (@color-link #00acff, brighter in dark). The three-class combo is unique
   to these recipient buttons. */
body[data-theme-skin="builtin-roundcube-elastic"] button.hover\\:text-primary.hover\\:underline.cursor-pointer {
  color: #00acff !important;
}
.dark body[data-theme-skin="builtin-roundcube-elastic"] button.hover\\:text-primary.hover\\:underline.cursor-pointer {
  color: #37beff !important;
}
/* The sender's email address printed under the name is muted grey; Roundcube
   shows it link-blue too. It's the div immediately after the name row
   (.flex.items-center.flex-wrap), which the contact-card org line is not, so
   this sibling selector scopes it to the sender email only. */
body[data-theme-skin="builtin-roundcube-elastic"] .flex.items-center.flex-wrap + div.text-muted-foreground.truncate {
  color: #00acff !important;
}
.dark body[data-theme-skin="builtin-roundcube-elastic"] .flex.items-center.flex-wrap + div.text-muted-foreground.truncate {
  color: #37beff !important;
}

/* ── Elastic context / popup menus ───────────────────────────── */
/* Roundcube highlights the hovered menu entry with a solid accent fill and
   white text (@color-menu-hover-background: @color-main, @color-menu-hover:
   #fff) - the same in light and dark. */
body[data-theme-skin="builtin-roundcube-elastic"] [role="menu"] [role="menuitem"]:hover,
body[data-theme-skin="builtin-roundcube-elastic"] [role="menu"] [role="menuitem"]:focus,
body[data-theme-skin="builtin-roundcube-elastic"] [role="menu"] [role="menuitem"]:focus-visible {
  background-color: #37beff !important;
  color: #ffffff !important;
}
/* Icons (currentColor) and muted accessories (shortcuts, submenu chevron)
   follow the white text on hover. */
body[data-theme-skin="builtin-roundcube-elastic"] [role="menu"] [role="menuitem"]:hover svg,
body[data-theme-skin="builtin-roundcube-elastic"] [role="menu"] [role="menuitem"]:focus svg,
body[data-theme-skin="builtin-roundcube-elastic"] [role="menu"] [role="menuitem"]:hover .text-muted-foreground {
  color: #ffffff !important;
}

/* ── Elastic folder list: unread count as a rounded pill ─────── */
/* Roundcube shows the unread count in a small grey pill on the right, and no
   badge at all when a folder has nothing unread. Bulwark renders plain
   "unread / total" text; the counts container is
   span.ml-2.flex-shrink-0.gap-1.items-baseline holding an unread span
   (.font-semibold), an optional "/" (.text-muted-foreground/60) and the total
   (.text-muted-foreground). Reshape it into a pill, drop the total + slash,
   and hide the whole badge when there's no unread span. */
body[data-theme-skin="builtin-roundcube-elastic"] .bg-secondary.border-r span.ml-2.flex-shrink-0.gap-1.items-baseline {
  align-items: center !important;
  justify-content: center;
  min-width: 1.6rem;
  height: 1.2rem;
  padding: 0 0.45rem;
  border-radius: 0.75rem;
  background-color: #e4e8ea;
}
body[data-theme-skin="builtin-roundcube-elastic"] .bg-secondary.border-r span.ml-2.flex-shrink-0.gap-1.items-baseline > span.text-muted-foreground,
body[data-theme-skin="builtin-roundcube-elastic"] .bg-secondary.border-r span.ml-2.flex-shrink-0.gap-1.items-baseline > span.text-muted-foreground\\/60 {
  display: none !important;
}
body[data-theme-skin="builtin-roundcube-elastic"] .bg-secondary.border-r span.ml-2.flex-shrink-0.gap-1.items-baseline > span {
  color: #5e6b70 !important;
  font-weight: 600 !important;
}
/* No unread span -> no badge (matches Sent/Drafts in Roundcube). */
body[data-theme-skin="builtin-roundcube-elastic"] .bg-secondary.border-r span.ml-2.flex-shrink-0.gap-1.items-baseline:not(:has(span.font-semibold)) {
  display: none !important;
}
.dark body[data-theme-skin="builtin-roundcube-elastic"] .bg-secondary.border-r span.ml-2.flex-shrink-0.gap-1.items-baseline {
  background-color: #3f4e55;
}
.dark body[data-theme-skin="builtin-roundcube-elastic"] .bg-secondary.border-r span.ml-2.flex-shrink-0.gap-1.items-baseline > span {
  color: #c9d3d5 !important;
}

/* A slightly bolder accent bar on the selected folder, like Elastic. */
body[data-theme-skin="builtin-roundcube-elastic"] .bg-secondary.border-r .border-l-2.border-primary {
  border-left-width: 3px !important;
}`;

// "Aurora Glass" - an ultra-modern glassmorphism skin. Vibrant indigo→cyan
// accents float over a fixed gradient-mesh canvas; every structural surface
// (nav rail, folder sidebar, cards, popovers, menus, dialogs, toolbars) is a
// translucent frosted pane with heavy backdrop-blur + saturation, hairline
// luminous borders and soft glow on the primary action.
//
// The colour tokens stay near-solid for legible text contrast; the frosted
// translucency + blur all live in the skin, where a single selector can pair
// an rgba background with the matching backdrop-filter.
const auroraCSS = `
:root {
  --color-border: oklch(0.195 0.0543 272.51 / 0.1);
  --color-input: oklch(0.195 0.0543 272.51 / 0.12);
  --color-ring: oklch(0.5871 0.2317 281.24);
  --color-background: oklch(0.9588 0.0138 272.69);
  --color-foreground: oklch(0.2123 0.047 277.99);
  --color-primary: oklch(0.5871 0.2317 281.24);
  --color-primary-foreground: oklch(1 0 0);
  --color-secondary: oklch(0.9297 0.0221 274.73);
  --color-secondary-foreground: oklch(0.2123 0.047 277.99);
  --color-muted: oklch(0.9383 0.0165 274.81);
  --color-muted-foreground: oklch(0.4974 0.0515 277.46);
  --color-accent: oklch(0.9299 0.0334 272.79);
  --color-accent-foreground: oklch(0.4568 0.2146 277.02);
  --color-destructive: oklch(0.645 0.2154 16.44);
  --color-destructive-foreground: oklch(1 0 0);
  --color-popover: oklch(1 0 0);
  --color-popover-foreground: oklch(0.2123 0.047 277.99);
  --color-sidebar: oklch(0.9588 0.0138 272.69);
  --color-sidebar-foreground: oklch(0.2123 0.047 277.99);
  --color-sidebar-border: oklch(0.195 0.0543 272.51 / 0.08);
  --color-sidebar-accent: oklch(0.5871 0.2317 281.24 / 0.1);
  --color-sidebar-accent-foreground: oklch(0.4568 0.2146 277.02);
  --color-card: oklch(1 0 0);
  --color-card-foreground: oklch(0.2123 0.047 277.99);
  --color-success: oklch(0.6959 0.1491 162.48);
  --color-success-foreground: oklch(1 0 0);
  --color-warning: oklch(0.7686 0.1647 70.08);
  --color-warning-foreground: oklch(0.2123 0.047 277.99);
  --color-info: oklch(0.7148 0.1257 215.22);
  --color-info-foreground: oklch(1 0 0);
  --color-selection: oklch(0.5871 0.2317 281.24 / 0.14);
  --color-selection-foreground: oklch(0.4568 0.2146 277.02);
  --color-unread: oklch(0.5871 0.2317 281.24);
  --color-chart-1: oklch(0.5871 0.2317 281.24);
  --color-chart-2: oklch(0.7148 0.1257 215.22);
  --color-chart-3: oklch(0.6559 0.2118 354.31);
  --color-chart-4: oklch(0.7686 0.1647 70.08);
  --color-chart-5: oklch(0.6959 0.1491 162.48);
}
.dark {
  --color-border: oklch(1 0 0 / 0.08);
  --color-input: oklch(1 0 0 / 0.1);
  --color-ring: oklch(0.6609 0.189 285.52);
  --color-background: oklch(0.1319 0.0186 276.77);
  --color-foreground: oklch(0.958 0.0202 279.94);
  --color-primary: oklch(0.6609 0.189 285.52);
  --color-primary-foreground: oklch(1 0 0);
  --color-secondary: oklch(1 0 0 / 0.06);
  --color-secondary-foreground: oklch(0.958 0.0202 279.94);
  --color-muted: oklch(1 0 0 / 0.05);
  --color-muted-foreground: oklch(0.7134 0.0529 277.56);
  --color-accent: oklch(0.6609 0.189 285.52 / 0.16);
  --color-accent-foreground: oklch(0.8233 0.095 290.21);
  --color-destructive: oklch(0.7192 0.169 13.43);
  --color-destructive-foreground: oklch(0.1741 0.0274 358.91);
  --color-popover: oklch(0.1996 0.0455 279.54);
  --color-popover-foreground: oklch(0.958 0.0202 279.94);
  --color-sidebar: oklch(0.1499 0.0362 278.28);
  --color-sidebar-foreground: oklch(0.958 0.0202 279.94);
  --color-sidebar-border: oklch(1 0 0 / 0.07);
  --color-sidebar-accent: oklch(0.6609 0.189 285.52 / 0.18);
  --color-sidebar-accent-foreground: oklch(0.8233 0.095 290.21);
  --color-card: oklch(1 0 0 / 0.04);
  --color-card-foreground: oklch(0.958 0.0202 279.94);
  --color-success: oklch(0.7729 0.1535 163.22);
  --color-success-foreground: oklch(0.2688 0.0527 163.85);
  --color-warning: oklch(0.8369 0.1644 84.43);
  --color-warning-foreground: oklch(0.1942 0.0291 88.96);
  --color-info: oklch(0.7971 0.1339 211.53);
  --color-info-foreground: oklch(0.2342 0.038 218.99);
  --color-selection: oklch(0.6609 0.189 285.52 / 0.22);
  --color-selection-foreground: oklch(0.8233 0.095 290.21);
  --color-unread: oklch(0.6609 0.189 285.52);
  --color-chart-1: oklch(0.6609 0.189 285.52);
  --color-chart-2: oklch(0.7971 0.1339 211.53);
  --color-chart-3: oklch(0.7253 0.1752 349.76);
  --color-chart-4: oklch(0.8369 0.1644 84.43);
  --color-chart-5: oklch(0.7729 0.1535 163.22);
}`;

// Glassmorphism skin: the frosted translucency, backdrop-blur, gradient-mesh
// canvas, luminous borders and glow that the colour tokens alone can't carry.
// Scoped under the skin body attribute so it detaches cleanly on switch-off.
const auroraSkin = `
body[data-theme-skin="builtin-aurora-glass"] {
  font-family: "Inter", "SF Pro Display", "Segoe UI", system-ui, -apple-system, sans-serif;
  letter-spacing: -0.01em;
}

/* ── Gradient-mesh canvas ──────────────────────────────────────── */
/* A multi-stop radial mesh painted onto the app-shell root (the unique
   .bg-background.overflow-hidden container) so the frosted panes have
   something luminous to blur. Painting it directly on the shell - rather than
   a fixed body::before with z-indexed children - avoids creating stacking
   contexts on portaled popups/dialogs (Radix portals render as direct <body>
   children), which would otherwise break their layering. */
body[data-theme-skin="builtin-aurora-glass"] .bg-background.overflow-hidden {
  background-color: var(--color-background);
  background-image:
    radial-gradient(60rem 60rem at 12% -10%, rgba(109, 92, 255, 0.22), transparent 60%),
    radial-gradient(50rem 50rem at 105% 5%, rgba(6, 182, 212, 0.18), transparent 55%),
    radial-gradient(55rem 55rem at 80% 110%, rgba(236, 72, 153, 0.16), transparent 60%),
    radial-gradient(45rem 45rem at -5% 95%, rgba(16, 185, 129, 0.12), transparent 55%);
}
.dark body[data-theme-skin="builtin-aurora-glass"] .bg-background.overflow-hidden {
  background-image:
    radial-gradient(60rem 60rem at 12% -10%, rgba(109, 92, 255, 0.16), transparent 58%),
    radial-gradient(50rem 50rem at 105% 5%, rgba(6, 182, 212, 0.11), transparent 52%),
    radial-gradient(55rem 55rem at 80% 110%, rgba(236, 72, 153, 0.10), transparent 58%),
    radial-gradient(45rem 45rem at -5% 95%, rgba(16, 185, 129, 0.07), transparent 52%);
}

/* ── Pill-soft radii everywhere ───────────────────────────────── */
body[data-theme-skin="builtin-aurora-glass"] .rounded-md,
body[data-theme-skin="builtin-aurora-glass"] .rounded-lg {
  border-radius: 0.85rem !important;
}
body[data-theme-skin="builtin-aurora-glass"] .rounded-xl,
body[data-theme-skin="builtin-aurora-glass"] .rounded-2xl {
  border-radius: 1.25rem !important;
}

/* ── Frosted panes: the shared glass recipe ───────────────────── */
/* Nav rail, folder sidebar, content backing, cards, popovers, dialogs and
   menus all share one frosted treatment - translucent fill + heavy backdrop
   blur + saturation so the mesh and neighbours bleed through softly. */
body[data-theme-skin="builtin-aurora-glass"] .w-14.bg-secondary,
body[data-theme-skin="builtin-aurora-glass"] .bg-secondary.border-r {
  background-color: rgba(255, 255, 255, 0.55) !important;
  backdrop-filter: blur(26px) saturate(180%);
  -webkit-backdrop-filter: blur(26px) saturate(180%);
  border-color: rgba(13, 18, 45, 0.08) !important;
}
.dark body[data-theme-skin="builtin-aurora-glass"] .w-14.bg-secondary,
.dark body[data-theme-skin="builtin-aurora-glass"] .bg-secondary.border-r {
  background-color: rgba(8, 9, 22, 0.82) !important;
  border-color: rgba(255, 255, 255, 0.07) !important;
}

/* The "no conversation selected" empty pane sits inside an opaque
   bg-background column, so it can't inherit the shell mesh - paint the same
   gradient mesh directly onto it so the placeholder reads as glass too. */
body[data-theme-skin="builtin-aurora-glass"] .bg-gradient-to-br.from-muted\\/30.to-muted\\/50 {
  background-color: var(--color-background) !important;
  background-image:
    radial-gradient(50rem 50rem at 15% 0%, rgba(109, 92, 255, 0.22), transparent 60%),
    radial-gradient(45rem 45rem at 100% 10%, rgba(6, 182, 212, 0.18), transparent 55%),
    radial-gradient(50rem 50rem at 85% 105%, rgba(236, 72, 153, 0.16), transparent 60%) !important;
}
.dark body[data-theme-skin="builtin-aurora-glass"] .bg-gradient-to-br.from-muted\\/30.to-muted\\/50 {
  background-image:
    radial-gradient(50rem 50rem at 15% 0%, rgba(109, 92, 255, 0.18), transparent 58%),
    radial-gradient(45rem 45rem at 100% 10%, rgba(6, 182, 212, 0.12), transparent 52%),
    radial-gradient(50rem 50rem at 85% 105%, rgba(236, 72, 153, 0.11), transparent 58%) !important;
}
/* The reading-pane message backing goes clear glass so the frosted panes and
   gradient bleed through softly. */
body[data-theme-skin="builtin-aurora-glass"] .bg-muted\\/30 {
  background: transparent !important;
}

/* Cards, popovers and dialogs: brighter frosted glass with a luminous edge. */
body[data-theme-skin="builtin-aurora-glass"] .bg-card,
body[data-theme-skin="builtin-aurora-glass"] .bg-popover,
body[data-theme-skin="builtin-aurora-glass"] [role="menu"],
body[data-theme-skin="builtin-aurora-glass"] [role="dialog"],
body[data-theme-skin="builtin-aurora-glass"] [role="listbox"] {
  background-color: rgba(255, 255, 255, 0.72) !important;
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 12px 40px -12px rgba(20, 22, 46, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
}
.dark body[data-theme-skin="builtin-aurora-glass"] .bg-card,
.dark body[data-theme-skin="builtin-aurora-glass"] .bg-popover,
.dark body[data-theme-skin="builtin-aurora-glass"] [role="menu"],
.dark body[data-theme-skin="builtin-aurora-glass"] [role="dialog"],
.dark body[data-theme-skin="builtin-aurora-glass"] [role="listbox"] {
  background-color: rgba(16, 17, 38, 0.86) !important;
  border: 1px solid rgba(255, 255, 255, 0.10) !important;
  box-shadow: 0 16px 48px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}

/* ── Primary action: gradient fill + glow ─────────────────────── */
body[data-theme-skin="builtin-aurora-glass"] .bg-primary.text-primary-foreground {
  background-image: linear-gradient(135deg, #7c5cff 0%, #6d5cff 45%, #4f9bff 100%) !important;
  border: none !important;
  color: #ffffff !important;
  box-shadow: 0 6px 20px -4px rgba(109, 92, 255, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
  transition: box-shadow 160ms ease, filter 160ms ease;
}
body[data-theme-skin="builtin-aurora-glass"] .bg-primary.text-primary-foreground:hover {
  filter: brightness(1.08);
  box-shadow: 0 10px 30px -4px rgba(109, 92, 255, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
}
.dark body[data-theme-skin="builtin-aurora-glass"] .bg-primary.text-primary-foreground {
  background-image: linear-gradient(135deg, #8b7bff 0%, #6d5cff 50%, #22d3ee 130%) !important;
  box-shadow: 0 6px 24px -4px rgba(139, 123, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

/* ── Selected folder / row: soft tinted glass + accent bar ────── */
body[data-theme-skin="builtin-aurora-glass"] .bg-secondary.border-r .border-l-2.border-primary {
  border-left-width: 3px !important;
}

/* ── On/off switch: gradient when active ──────────────────────── */
body[data-theme-skin="builtin-aurora-glass"] [role="switch"][aria-checked="true"] {
  background-image: linear-gradient(135deg, #7c5cff, #4f9bff) !important;
  border-color: transparent !important;
  box-shadow: 0 2px 10px -1px rgba(109, 92, 255, 0.6) !important;
}
.dark body[data-theme-skin="builtin-aurora-glass"] [role="switch"][aria-checked="true"] {
  background-image: linear-gradient(135deg, #8b7bff, #22d3ee) !important;
}

/* ── Menu hover: tinted accent slab (keeps glass legible) ─────── */
body[data-theme-skin="builtin-aurora-glass"] [role="menu"] [role="menuitem"]:hover,
body[data-theme-skin="builtin-aurora-glass"] [role="menu"] [role="menuitem"]:focus,
body[data-theme-skin="builtin-aurora-glass"] [role="menu"] [role="menuitem"]:focus-visible {
  background-color: rgba(109, 92, 255, 0.14) !important;
  color: var(--color-foreground) !important;
}
.dark body[data-theme-skin="builtin-aurora-glass"] [role="menu"] [role="menuitem"]:hover,
.dark body[data-theme-skin="builtin-aurora-glass"] [role="menu"] [role="menuitem"]:focus,
.dark body[data-theme-skin="builtin-aurora-glass"] [role="menu"] [role="menuitem"]:focus-visible {
  background-color: rgba(139, 123, 255, 0.22) !important;
}`;

export const BUILTIN_THEMES: InstalledTheme[] = [
  {
    id: 'builtin-qui',
    name: 'Qui',
    version: '1.0.0',
    author: 'Built-in',
    description: 'Clean, modern zinc-and-blue theme inspired by autobrr/qui',
    css: quiCSS,
    variants: ['light', 'dark'],
    enabled: true,
    builtIn: true,
  },
  {
    id: 'builtin-nord',
    name: 'Nord',
    version: '1.0.0',
    author: 'Built-in',
    description: 'Arctic, north-bluish color palette inspired by nordtheme.com',
    css: nordCSS,
    variants: ['light', 'dark'],
    enabled: true,
    builtIn: true,
  },
  {
    id: 'builtin-catppuccin',
    name: 'Catppuccin',
    version: '1.0.0',
    author: 'Built-in',
    description: 'Soothing pastel theme with Latte (light) and Mocha (dark) variants',
    css: catppuccinCSS,
    variants: ['light', 'dark'],
    enabled: true,
    builtIn: true,
  },
  {
    id: 'builtin-solarized',
    name: 'Solarized',
    version: '1.0.0',
    author: 'Built-in',
    description: 'Precision colors for machines and people by Ethan Schoonover',
    css: solarizedCSS,
    variants: ['light', 'dark'],
    enabled: true,
    builtIn: true,
  },
  {
    id: 'builtin-roundcube-elastic',
    name: 'Roundcube Elastic',
    version: '1.0.0',
    author: 'Built-in',
    description: 'Faithful recreation of Roundcube\'s Elastic skin - Roboto, the #37beff blue, and the dark task-menu rail',
    css: elasticCSS,
    skin: elasticSkin,
    variants: ['light', 'dark'],
    typography: { fontSans: 'Roboto, "Helvetica Neue", Arial, sans-serif', baseFontSize: '14px' },
    enabled: true,
    builtIn: true,
  },
  {
    id: 'builtin-aurora-glass',
    name: 'Aurora Glass',
    version: '1.0.0',
    author: 'Built-in',
    description: 'Ultra-modern glassmorphism - frosted blurred panes floating over a vibrant indigo→cyan gradient mesh, with glowing gradient actions',
    css: auroraCSS,
    skin: auroraSkin,
    variants: ['light', 'dark'],
    typography: { fontSans: '"Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif' },
    enabled: true,
    builtIn: true,
  },
];
