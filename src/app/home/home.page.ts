import { Component } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { PermissionError } from '../services/permission-error';
import { ImageManagementService } from '../services/image-management.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public imagePaths: string[];
  public isDesktop: boolean;
  public progress;
  public url = 'http://192.168.137.1/ecommerce/public/uploads/';
  // public url = 'http://localhost/ecommerce/public/uploads/';

  constructor(
    private imageManagementService: ImageManagementService,
    private loadingCtrl: LoadingController,
    public platform: Platform) {

      this.imageManagementService.uploadProgress.subscribe(value => {
        this.progress = value;
        console.log('PROGRESS: ' + value);
      });
    }

  // tslint:disable-next-line:use-life-cycle-interface
  async ngOnInit() {
    this.isDesktop = this.platform.is('desktop');
    try {
      await this.presentLoading('Loading images...');
      await this.loadImagePaths();
    } catch (error) {
      console.log(error);
      // this.loadingSpinner.dismiss();
    }
  }

  public async uploadFromImagePicker() {
    try {
      await this.presentLoading('Loading images...');
      await this.imageManagementService.uploadFromImagePicker();
      await this.loadImagePaths();
      // this.uploadingSpinner.dismiss();
    } catch (error) {
      console.log(error);
      // this.loadingSpinner.dismiss();
      if (error instanceof PermissionError) {
        alert('You must give the app permission for the gallery before you can choose an image');
      }
    }
  }

  public async uploadFromCamera() {
    try {
      await this.presentLoading('Uploading images...');
      await this.imageManagementService.uploadFromCamera();
      await this.loadImagePaths();
      // this.uploadingSpinner.dismiss();
    } catch (error) {
      console.log(error);
    }
  }

  async uploadWebFile(event) {
    const formData = new FormData();
    Array.from(event.target.files).forEach((file: File) => formData.append('photos[]', file, file.name));
    await this.imageManagementService.uploadImages(formData).subscribe(
      res => {
        console.log(res);
      });
    await this.loadImagePaths();
  }

  private async loadImagePaths() {
    await this.imageManagementService.listImagesOnServer().then(res => {
      this.imagePaths = res.imageName;
      console.log(this.imagePaths);
    });
  }

  async presentLoading(msg) {
    const loading = await this.loadingCtrl.create({
      message: msg,
      duration: 2000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();

    console.log('Loading dismissed!');
  }
}
