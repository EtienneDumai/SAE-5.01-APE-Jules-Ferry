import { Component, inject, OnInit } from '@angular/core';
import { Evennement } from '../../models/Evennement/evennement';
import { EvennementService } from '../../services/Evennement/evennement.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-evennement-detail',
  standalone: true,
  imports: [],
  templateUrl: './evennement-detail.component.html',
  styleUrl: './evennement-detail.component.css'
})
export class EvennementDetailComponent implements OnInit {
  evennement !: Evennement;
    private readonly evennementService : EvennementService = inject(EvennementService);
    private readonly route: ActivatedRoute = inject(ActivatedRoute);
    ngOnInit() : void{
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.evennementService.getEvennementById(id).subscribe({
        next: (data) => {
          this.evennement = data;
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
}
