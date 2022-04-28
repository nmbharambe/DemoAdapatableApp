import {Component, OnInit} from '@angular/core';
import { AdaptableApi, AdaptableOptions, AdaptableToolPanelAgGridComponent, Layout } from '@adaptabletools/adaptable-angular-aggrid';
import { ClientSideRowModelModule, ColDef, GridOptions, GridReadyEvent, Module, ValueFormatterParams } from '@ag-grid-community/all-modules';
import { RowGroupingModule, SetFilterModule, ColumnsToolPanelModule, MenuModule, ExcelExportModule } from '@ag-grid-enterprise/all-modules';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'DemoAdapatableApp';
  fetchedData!: any[]
  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  gridOptions!: GridOptions;
  defaultColDef!: ColDef;
  agGridModules: Module[] = [ClientSideRowModelModule,RowGroupingModule,SetFilterModule,ColumnsToolPanelModule,MenuModule, ExcelExportModule];
  adaptableOptions!: AdaptableOptions;
  adaptableApi!: AdaptableApi;

  clicked: boolean = false;
  choice!: number;

  loading = false;

  ngOnInit(){
    this.adaptableOptions = {
      primaryKey: '',
      autogeneratePrimaryKey: true,
      adaptableId: '',
      adaptableStateKey: 'Detailed view state key',
      layoutOptions: {
        autoSaveLayouts: false,
        createDefaultLayout: true,
        autoSizeColumnsInLayout: true
      },
      toolPanelOptions: {
        toolPanelOrder: [ 'filters', 'columns','AdaptableToolPanel',],
      },
      predefinedConfig: {
        Dashboard: {
          ModuleButtons: ['Export', 'Layout','ConditionalStyle'],
          IsCollapsed: false,
          Tabs: [{
            Name:'Layout',
            Toolbars: ['Layout']
          }],
          IsHidden: false
        }
      }
    }

    this.defaultColDef = {
      resizable: true,
      enableValue: true,
      enableRowGroup: true,
      sortable: true,
      filter: true,
    }
    this.gridOptions = {
      columnDefs: this.columnDefs,
      defaultColDef: this.defaultColDef,
      tooltipShowDelay: 0,
      components: {
        AdaptableToolPanel: AdaptableToolPanelAgGridComponent
      },
    }


  }

  createColumnDefsAndData(choice: number = 1){
    if(choice === 1){
      this.columnDefs = [
        {field: 'AsofDate', tooltipField: 'AsofDate'}
        ,{field: 'PB Name', tooltipField: 'PB Name'}
        ,{field: 'Map Name', tooltipField: 'Map Name'}
        ,{field: 'Account Description', tooltipField: 'Account Description'}
        ]

      this.rowData = [
        {'AsofDate': '11/23/2021 12:00:00 AM', 'PB Name': 'BNP', 'Map Name': 'XYZ', 'Account': 8736423, 'Account Description': 'XXXXXXXX'},{'AsofDate': '11/29/2021 12:00:00 AM', 'PB Name': 'BNP', 'Map Name': 'ABC', 'Account': 87231, 'Account Description': 'XXXXXXXX'}]
    }
    else if(choice == 2){
      this.columnDefs = [
        {field: 'Cost Value Issue Funded SD'},
        {field: 'Market Value Issue Funded'},
        {field: 'Market Value Issue Funded SD'},
        {field: 'Dirty Market Value Issue Funded'},
        {field: 'Dirty Market Value Issue Funded SD'},
        {field: 'Maturity Date'}
      ]

      this.rowData = [
        {'Cost Value Issue Funded SD': 2341.000000004
       ,'Dirty Market Value Issue Funded': 1238387092.462600004
       ,'Dirty Market Value Issue Funded SD': -32423.462600004
       ,'Market Value Issue Funded': -876122.000000004
       ,'Market Value Issue Funded SD': 67.000000004
       ,'Maturity Date': "23 Nov 2013"}
      ]

    }
  }

  onClick(choice: number){
    this.gridOptions?.api?.destroy();
    this.clicked = false;

    this.loading = true;

    setTimeout(()=>{
      this.choice = choice;
      this.clicked = true;
      this.loading = false;
    },1500)
  }

  onGridReady(params: GridReadyEvent){
  }

  onAdaptableReady(
    {
      adaptableApi,
      vendorGrid,
    }: {
      adaptableApi: AdaptableApi;
      vendorGrid: GridOptions;
    }
  ) {
    this.adaptableApi = adaptableApi

    adaptableApi.eventApi.on(
      'AdaptableReady',
      (readyInfo: any) => {

        this.createColumnDefsAndData(this.choice);
        const gridOptions: GridOptions = readyInfo.gridOptions;
        this.gridOptions.api?.setColumnDefs(this.columnDefs);
        adaptableApi.gridApi.loadGridData(this.rowData);

        console.log(this.columnDefs)
        console.log(this.rowData)
        const layout: Layout = {
          Columns: this.columnDefs.map(x => x.field ?? ''),
          Name: 'Basic Dynamic Layout'
        }

        // WRONG
        // layoutApi.createAndSetLayout(layoutToCreate) is NOT the right method as it will always try to (re)create a layout with the same name
        // when failing to do so, it will stop to set the nwe layout all together

        // FIX
        // layoutApi.saveLayout() will create a new Layout or update an existing one
        // Layout is identified by the Name property or by the internal Uuid property (once it's saved in Adaptable State)
        adaptableApi.layoutApi.saveLayout(layout);
        // set the layout to be the one we just created/updated
        adaptableApi.layoutApi.setLayout(layout.Name)
      }
    )
  }
}
