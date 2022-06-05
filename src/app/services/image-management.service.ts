import { tap, map, last } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { RealFileLoaderService } from './real-file-loader.service';
import { PermissionError } from './permission-error';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { BehaviorSubject, Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'multipart/form-data'
  })
};


@Injectable({
  providedIn: 'root'
})

export class ImageManagementService {

  public uploadProgress: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public downloadProgress: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  // private readonly baseUrl = 'http://192.168.137.1:3000';
  private readonly baseUrl = 'http://192.168.137.1/ecommerce/public/api/upload';
  // private readonly baseUrl = 'http://localhost/ecommerce/public/api/upload';
  /* private cameraOptions: CameraOptions = {
     quality: 100,
     destinationType: this.camera.DestinationType.FILE_URI,
     encodingType: this.camera.EncodingType.JPEG,
     mediaType: this.camera.MediaType.PICTURE
   };*/


  private cameraOptions: CameraOptions = {
    quality: 95,
    destinationType: this.camera.DestinationType.FILE_URI,
    allowEdit: false,
    encodingType: this.camera.EncodingType.JPEG,
    targetWidth: 1280,
    targetHeight: 1280,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
    saveToPhotoAlbum: false,
    cameraDirection: this.camera.Direction.BACK,
  };

  constructor(
    private httpClient: HttpClient,
    private camera: Camera,
    private imagePicker: ImagePicker,
    private realFileLoaderService: RealFileLoaderService,
    private androidPermissions: AndroidPermissions // per
  ) { }

  /*async uploadFromImagePicker(): Promise<any[]> {
    const hasPermission = await this.imagePicker.hasReadPermission();
    if (!hasPermission) {
      throw new PermissionError(`You don't have permission to use the image picker yet.`);
    }
    const imagePaths: string[] = await this.imagePicker.getPictures({});
    const imageFiles = await this.realFileLoaderService.getMultipleFiles(imagePaths);
    const formData = new FormData();
    imageFiles.forEach(file => formData.append('photos[]', file, file.name));
    return this.uploadImages(formData);
  }*/

  async uploadFromImagePicker(): Promise<any[]> {
    const hasPermission = await this.imagePicker.hasReadPermission();
    if (!hasPermission) {
      throw new PermissionError(`You don't have permission to use the image picker yet.`);
    }
    const imagePaths: string[] = await this.imagePicker.getPictures({});
    const imageFiles = await this.realFileLoaderService.getMultipleFiles(imagePaths);
    const formData = new FormData();
    imageFiles.forEach(file => formData.append('photos[]', file, file.name));
    this.uploadImages(formData);
    return [];
  }

  async uploadFromCamera() {
    const permission: string = await this.camera.getPicture(this.cameraOptions);
    const imagePath: string = await this.camera.getPicture(this.cameraOptions);

    const imageFile = await this.realFileLoaderService.getSingleFile(imagePath);
    const formData = new FormData();
    formData.append('photos', imageFile, imageFile.name);
    const result = await this.uploadImages(formData);
    await this.camera.cleanup();
    return result;
  }


  async uploadFromCameraOLD() {

    this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
      .then(
        result => {
          const imagePath: any = this.camera.getPicture(this.cameraOptions);

          const imageFile: any = this.realFileLoaderService.getSingleFile(imagePath);
          const formData = new FormData();
          formData.append('photos', imageFile, imageFile.name);
          const resultd = this.uploadImages(formData);
          this.camera.cleanup();
          return resultd;

        },
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
      );
  }


  /*public async uploadImages(formData: FormData): Promise<any[]> {
    return this.httpClient.post<any[]>(`${this.baseUrl}/41`, formData).toPromise();
  }*/

  /* uploadImages(formData: FormData): Observable<any> {
     return this.httpClient.post<any>(`${this.baseUrl}/37`, formData).pipe(
       tap(async (res) => {
         console.log(`product Uploaded: ${res.status}`);
         console.log(`Message: ${res.message}`);
       }),
       map(event => this.getStatusMessage(event)),
       last());
   }*/

  uploadImages(formData: FormData): Observable<any> {
    /*return this.httpClient.post<any>(`${this.baseUrl}/37`, formData).pipe(
      tap(async (res) => {
        console.log(`product Uploaded: ${res.status}`);
        console.log(`Message: ${res.message}`);
      }),
      map(event => this.getStatusMessage(event)),
      last());*/

    console.log('In upload');

    const customHeaders = new HttpHeaders({
      // 'Accepted-Encoding': 'application/json',
      'Content-Type': 'application/json',
    });

    const customOptions = {

      reportProgress: true,
    };

    const req = new HttpRequest('POST', `${this.baseUrl}/37`, formData, customOptions);
    this.resetProgress();

    return this.httpClient.request(req).pipe(
      map(event => {
        this.getStatusMessage(event);
      }),
      tap(message => console.log(message)),
      last()
    );
  }

  /*async listImagesOnServer(): Promise<string[]> {
    const imageNames = await this.httpClient.get<string[]>(`${this.baseUrl}/list-images`).toPromise();
    return imageNames.map(imageName => `${this.baseUrl}/images/${imageName}`);
  }*/

  async listImagesOnServer(): Promise<any> {
    const imageNames = await this.httpClient.get<any>(`${this.baseUrl}/37/list-images`).toPromise();
    return imageNames;
  }

  getStatusMessage(event) {

    let status;

    // console.log('EVENT: ' + event.type);

    switch (event.type) {
      case HttpEventType.Sent:
        return `Uploading Files`;

      case HttpEventType.UploadProgress:
        status = Math.round(100 * event.loaded / event.total);
        this.uploadProgress.next(status);
        console.log('IN PROGRESS: ' + status);
        return `Files are ${status}% uploaded`;

      case HttpEventType.DownloadProgress:
        status = Math.round(100 * event.loaded / event.total);
        this.downloadProgress.next(status); // NOTE: The Content-Length header must be set on the server to calculate this
        return `Files are ${status}% downloaded`;

      case HttpEventType.Response:
        return `Done`;

      default:
        return `Something went wrong`;
    }
  }

  resetProgress() {
    this.uploadProgress.next(0);
    this.downloadProgress.next(0);
  }
}
