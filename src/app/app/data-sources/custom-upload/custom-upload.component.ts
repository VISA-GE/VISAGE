import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { State } from '../../../state.store';
import { Track } from 'ngx-igv';
import { ToastService } from '../../services/toast/toast.service';

// Define FileFormat interface
interface FileFormat {
  name: string;
  aliases: string[];
  type: string;
}

// File formats from the old implementation
const fileFormats: FileFormat[] = [
  { name: 'BED', aliases: ['bed'], type: 'annotation' },
  { name: 'bedGraph', aliases: ['bedgraph'], type: 'wig' },
  { name: 'bigWig', aliases: ['bw', 'bigwig'], type: 'wig' },
  { name: 'VCF', aliases: ['vcf'], type: 'variant' },
  { name: 'GFF3/GTF', aliases: ['gff', 'gtf', 'gff3'], type: 'annotation' },
  { name: 'BAM', aliases: ['bam'], type: 'alignment' },
  { name: 'CRAM', aliases: ['cram'], type: 'alignment' },
  { name: 'bigBed', aliases: ['bb', 'bigbed'], type: 'annotation' },
  { name: 'TDF', aliases: ['tdf'], type: 'tdf' },
  { name: 'hic', aliases: ['hic'], type: 'interaction' },
  { name: 'cooler', aliases: ['cool'], type: 'interaction' },
];

@Component({
  selector: 'lib-custom-upload',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './custom-upload.component.html',
  styleUrl: './custom-upload.component.css',
  standalone: true,
})
export class CustomUploadComponent {
  fileFormGroup: FormGroup;
  indexFormGroup: FormGroup;
  detailsFormGroup: FormGroup;

  fileFormats = fileFormats;
  mainFile: File | undefined;
  indexFile: File | undefined;

  currentStep = 1;
  totalSteps = 3;

  state = inject(State);
  toastService = inject(ToastService);

  // File size limit: 50MB in bytes
  readonly MAX_FILE_SIZE = 50 * 1024 * 1024;

  constructor(private formBuilder: FormBuilder) {
    // File inputs don't need form controls since we handle File objects directly
    this.fileFormGroup = this.formBuilder.group({});
    this.indexFormGroup = this.formBuilder.group({});

    this.detailsFormGroup = new FormGroup({
      nameCtrl: new FormControl('', Validators.required),
      formatCtrl: new FormControl<FileFormat | undefined>(
        undefined,
        Validators.required
      ),
    });
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  resetForm() {
    this.fileFormGroup.reset();
    this.indexFormGroup.reset();
    this.detailsFormGroup.reset();
    this.mainFile = undefined;
    this.indexFile = undefined;
    this.currentStep = 1;
  }

  onMainFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];

      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        this.toastService.error(
          `File size (${this.formatFileSize(file.size)}) exceeds the 50MB limit`
        );
        target.value = ''; // Clear the input
        this.mainFile = undefined;
        return;
      }

      this.mainFile = file;
      // Don't try to set the file input value - it's not allowed for security reasons
      // The file input will show the selected file name automatically

      console.log('File selected:', file.name);

      // Auto-detect format and set name
      this.autoDetectFileFormat(file);
    }
  }

  onIndexFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];

      // Validate file size for index file too
      if (file.size > this.MAX_FILE_SIZE) {
        this.toastService.error(
          `Index file size (${this.formatFileSize(
            file.size
          )}) exceeds the 50MB limit`
        );
        target.value = ''; // Clear the input
        this.indexFile = undefined;
        return;
      }

      this.indexFile = file;
      // Don't try to set the file input value - it's not allowed for security reasons
      // The file input will show the selected file name automatically
    }
  }

  private autoDetectFileFormat(file: File) {
    const fileName = file.name;
    const extension = fileName
      .substring(fileName.lastIndexOf('.') + 1)
      .toLowerCase();
    const baseName =
      fileName.substring(0, fileName.lastIndexOf('.')) || fileName;

    console.log('Auto-detecting format for:', fileName);
    console.log('Extension:', extension);
    console.log('Base name:', baseName);

    const detectedFormat = this.fileFormats.find((format) =>
      format.aliases.includes(extension)
    );

    console.log('Detected format:', detectedFormat);

    // Use setTimeout to ensure the form is properly initialized
    setTimeout(() => {
      this.detailsFormGroup.patchValue({
        nameCtrl: baseName,
        formatCtrl: detectedFormat,
      });

      // Also mark the form as touched to trigger validation and UI updates
      this.detailsFormGroup.markAsTouched();
      this.detailsFormGroup.get('nameCtrl')?.markAsTouched();
      this.detailsFormGroup.get('formatCtrl')?.markAsTouched();

      console.log('Form updated with values:', {
        nameCtrl: baseName,
        formatCtrl: detectedFormat,
      });
    }, 0);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  addFile() {
    if (!this.mainFile || !this.detailsFormGroup.valid) {
      this.toastService.error('Please complete all required fields');
      return;
    }

    try {
      const selectedFormat = this.detailsFormGroup.value.formatCtrl!;
      const trackName = this.detailsFormGroup.value.nameCtrl!;

      const track: Track = {
        name: trackName,
        type: selectedFormat.type as any,
        format: selectedFormat.aliases[0],
        url: URL.createObjectURL(this.mainFile),
        removable: true, // Make it removable like track-hub tracks
      };

      // Add index file if provided
      if (this.indexFile) {
        track.indexURL = URL.createObjectURL(this.indexFile);
      }

      // Add the track to state (this will show success toast automatically)
      this.state.addTrack(track);

      // Reset the form after successful upload
      this.resetForm();
    } catch (error) {
      console.error('Error creating track:', error);
      this.toastService.error('Failed to create track. Please try again.');
    }
  }
}
