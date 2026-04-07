import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-a-propos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './a-propos.component.html',
  styleUrl: './a-propos.component.css'
})
export class AProposComponent {
  teamMembers = [
    { name: 'Rémi GENTIL', role: 'Proxy Product Owner / Développeur', website: 'https://remi-gentil.vercel.app/', linkedin: 'https://www.linkedin.com/in/remi-gentil/' },
    { name: 'Etiene DUMAI', role: 'Scrum Master / Développeur', website: 'https://github.com/', linkedin: 'https://www.linkedin.com/in/etienne-dumai/' },
    { name: 'Théo LAGÜE', role: 'Développeur', website: 'https://portfolio-three-mu-50.vercel.app/', linkedin: 'https://www.linkedin.com/in/th%C3%A9o-lag%C3%BCe-500503268/' },
    { name: 'Jules VINET-LATRILLE', role: 'Développeur', website: 'https://julesvinetlatrille.org/', linkedin: 'https://www.linkedin.com/in/julesvinetlatrille/' },
    { name: 'Mouhamadou Moussa KEITA', role: 'Développeur', linkedin: 'https://www.linkedin.com/in/mouhamadou-moussa-keita-ba73b02b8/' },
    { name: 'Thibault CHIPY', role: 'Développeur', website: 'https://thibault-chipy.github.io/portfolio/', linkedin: 'https://www.linkedin.com/in/thibault-chipy/' }
  ];
}
