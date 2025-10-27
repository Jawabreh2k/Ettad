import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@components/button/button.component';
import { StepperComponent, Step } from '@components/stepper/stepper.component';
import { CartridgeDetailsComponent, CartridgeDetails } from './components/cartridge-details/cartridge-details.component';
import { CartridgeListComponent, Cartridge } from './components/cartridge-list/cartridge-list.component';
import { UsageFormComponent } from './components/usage-form/usage-form.component';
import { ReviewFormComponent } from './components/review-form/review-form.component';

@Component({
  selector: 'app-new-issue-request',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ButtonComponent,
    StepperComponent,
    CartridgeDetailsComponent,
    CartridgeListComponent,
    UsageFormComponent,
    ReviewFormComponent
  ],
  templateUrl: './new-issue-request.component.html',
  styleUrls: ['./new-issue-request.component.css']
})
export class NewIssueRequestComponent implements OnInit {
  currentStep = 0;
  steps: Step[] = [
    { label: 'newIssueRequest.selection', completed: false },
    { label: 'newIssueRequest.usage', completed: false },
    { label: 'newIssueRequest.review', completed: false },
    { label: 'newIssueRequest.send', completed: false }
  ];

  // Step 1: Selection filters
  bulletDiameters = ['5.56', '7.62', '9mm', '.45'];
  caseLengths = ['5.56 x 45', '7.62 x 39', '7.62 x 51', '9 x 19'];
  linkedOptions = ['Linked', 'Not Linked', 'Select option'];
  natureOptions = [
    'Ball (FMJ)',
    'Tracer',
    'Armor-piercing (AP)',
    'Hollow-point',
    'Incendiary',
    'Select nature'
  ];
  orderPriorities = ['High Priority', 'Medium Priority', 'Low Priority'];

  selectedBulletDiameter = '5.56';
  selectedCaseLength = '5.56 x 45';
  selectedLinked = 'Not Linked';
  selectedNature = 'Select nature';
  selectedPriority = 'High Priority';
  quantity: number | null = null;

  cartridges: Cartridge[] = [
    { 
      name: '5.56 mm x 45 Ball (FMJ), M193',
      selected: false,
      productId: '456567',
      ncn: 'N-Ammunition',
      primaryPurpose: 'Anti-Personnel',
      projectileColor: 'No Color - Plain',
      totalWeight: '11.7 - 0.8 gram',
      projectileMaterial: 'Copper Alloy #220, Lead Antimony Alloy',
      caseType: 'Rimless',
      primer: 'Non-corrosive Type',
      propellant: 'WC-844 (smokeless, Double Base or Equivalent)',
      hazardDivision: '1.4 s',
      capabilityGroup: 'G'
    },
    { name: '9 x 19mm - Piney Mountain (Tracer: Green)', selected: false },
    { name: '9 x 19mm (Training(Plastic - Plastic projectile) - Not Linked', selected: false },
    { name: '5.45 x 39mm - R((No. Supplier) (Hollow-point Not Linked)', selected: false },
    { name: '5.45 x 39mm - (R) KINTEX (Tracer - Not Linked)', selected: false },
    { name: '5.45 x 39mm - R (No. Supplier) (Incendiary - Not Linked)', selected: false },
    { name: '5.45 x 39mm - R(No. Supplier)(HE / HEI - Not Linked', selected: false },
    { name: '5.45 x 39mm (R) Denver Bullets (Armour-piercing (AP) - Not Linked', selected: false }
  ];

  filteredCartridges: Cartridge[] = [];
  selectedCartridgeForView: CartridgeDetails | null = null;
  showCartridgeDetails: boolean = false;

  ngOnInit(): void {
    this.filterCartridges();
  }

  filterCartridges(): void {
    // Simple filter logic - in real app would filter based on selections
    this.filteredCartridges = [...this.cartridges];
  }

  onCartridgeClick(cartridge: Cartridge): void {
    // Show detailed view instead of toggling selection
    this.selectedCartridgeForView = cartridge;
    this.showCartridgeDetails = true;
  }

  onCloseCartridgeDetails(): void {
    this.showCartridgeDetails = false;
    this.selectedCartridgeForView = null;
  }

  onSelectCartridge(): void {
    if (this.selectedCartridgeForView) {
      const cartridge = this.cartridges.find(c => c.name === this.selectedCartridgeForView?.name);
      if (cartridge) {
        cartridge.selected = true;
      }
      this.showCartridgeDetails = false;
      this.selectedCartridgeForView = null;
    }
  }

  onStepChange(step: number): void {
    this.currentStep = step;
  }

  onConfirmSelection(): void {
    const hasSelection = this.cartridges.some(c => c.selected);
    if (hasSelection) {
      this.steps[0].completed = true;
      this.currentStep = 1;
    }
  }

  onNext(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.steps[this.currentStep].completed = true;
      this.currentStep++;
      
      // Auto-submit order when reaching the Send step
      if (this.currentStep === 3) {
        this.onSubmitOrder();
      }
    }
  }

  onPrevious(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  // Step 2: Usage form data
  fromReserve: string = 'Yes';
  usePurpose: string = '';
  annualDiscardSpecialOps: string = '';
  usageLocation: string = '';
  numberOfOfficers: number | null = null;
  numberOfOtherRanks: number | null = null;
  usageDate: string = '';
  usageTime: string = '';

  // Reserve details (read-only)
  totalReserve = 150000;
  availableReserve = 100000;
  orderedQuantity = 50000;
  utilizedQuantity = 50000;

  // Step 3: Review - Requester Details
  requesterName: string = 'Name';
  requesterComments: string = 'None';

  // Step 3: Review - Order Details
  orderType: string = 'New Issue Request';
  orderDocument: string = ''; // Will store file path/name

  // Step 4: Send
  orderSubmitted: boolean = false;

  onSubmitOrder(): void {

    this.orderSubmitted = true;
  }

  onTrackOrder(): void {
 
    console.log('Track Order clicked');
 
  }

  resetForm(): void {
    this.currentStep = 0;
    this.orderSubmitted = false;
    this.steps.forEach(step => step.completed = false);
    this.cartridges.forEach(c => c.selected = false);
    this.fromReserve = 'Yes';
    this.usePurpose = '';
    this.annualDiscardSpecialOps = '';
    this.usageLocation = '';
    this.numberOfOfficers = null;
    this.numberOfOtherRanks = null;
    this.usageDate = '';
    this.usageTime = '';
    this.requesterName = 'Name';
    this.requesterComments = 'None';
  }
}
