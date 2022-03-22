import { Observable } from "rxjs";
import { CategoriaModel } from "./../../models/categoria.model";
import { MessageService, SelectItem } from "primeng/api";
import { CompetenciaModel } from "./../../models/competencia.model";
import { CategoriaService } from "./../../services/categoria.service";
import { Component, Input, OnInit, Output, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CompetenciaService } from "../../services/competencia.service";
import { ActivatedRoute, Router } from "@angular/router";
import { EventEmitter } from "@angular/core";

@Component({
    selector: "app-competencia-form",
    templateUrl: "./competencia-form.component.html",
    styleUrls: ["./competencia-form.component.css"],
})
export class CompetenciaFormComponent implements OnInit {
    public compForm: FormGroup;
    categorias: SelectItem[] = [];
    titleModal = true;

    @Input() display = false;
    @Input() competenciaEditada: CompetenciaModel;

    @Output() refreshCompetencias = new EventEmitter();
    @Output() aoFechar = new EventEmitter();


    constructor(
        private fb: FormBuilder,
        private rest: CompetenciaService,
        private categoriaService: CategoriaService,
        public activatedRouter: ActivatedRoute,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.getCategoriasDropDown();
        this.compForm = this.fb.group({
            id: [null],
            nome: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(55)]],
            descricao: ["", [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
            idCategoria: ["", [Validators.required]],
        });
        if (!!this.competenciaEditada) {
            this.titleModal = false;
            this.compForm.patchValue(this.competenciaEditada);
            console.log("isso: " + this.competenciaEditada);
        }
    }

    verificaId() {
        if (!this.compForm.get("id").value) {
            this.createCompetencia();
            return;
        }
        this.updateCompetencia();
    }

    createCompetencia() {
        this.finalizarRequisicao(
            this.rest.postCompetencia(this.compForm.getRawValue())
        );
        this.messageService.add({
            severity:"success",
            summary:"Confirmação",
            detail:"Competência criada com sucesso!"
        })
    }

    updateCompetencia() {
        this.finalizarRequisicao(
            this.rest.putCompetencia(this.compForm.getRawValue())
        );
        this.messageService.add({
            severity:"success",
            summary:"Confirmação",
            detail:"Competência atualizada com sucesso!"
        })
    }

    finalizarRequisicao(observable: Observable<CompetenciaModel>) {
        observable.subscribe((result) => {
            this.refreshCompetencias.emit();
            this.fecharModal();
        });
    }

    public getCategoriasDropDown(){
        this.categoriaService.getCategoriasDropDown().subscribe(
            (data) => {
                this.categorias = data;
            },
            (error) => {
                console.log("Erro", error);
            }
        );
    }

    fecharModal() {
        this.display = false;
        this.aoFechar.emit();
    }

    get title() {
        return this.titleModal ? "Nova competência" : "Editar competência";
    }

    get titleButton() {
        return this.titleModal ? "Criar" : "Editar";
    }

    verificaValidacao(campo){
        return this.compForm.get(campo).valid && this.compForm.get(campo).touched;
    }

    erroCss(campo){
        return{
            'has-error': this.verificaValidacao(campo),
            'has-feedback': this.verificaValidacao(campo)
        }
    }
}
