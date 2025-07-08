import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  onSocialClick(platform: string): void {
    const urls = {
      'twitter': 'https://twitter.com/platform-x',
      'github': 'https://github.com/platform-x',
      'linkedin': 'https://linkedin.com/company/platform-x',
      'discord': 'https://discord.gg/platform-x'
    };
    
    const url = urls[platform as keyof typeof urls];
    if (url) {
      window.open(url, '_blank');
    }
  }

  onLinkClick(link: string): void {
    console.log(`Navigate to: ${link}`);
    // Implement navigation logic here
  }
}