import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { ModProfileService } from '../service/mod-profile.service';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
declare var toast: any;


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: [
    `../../admin/css/sb-admin-2.min.css`,
    `../../admin/css/home.css`
  ]
})
export class ProfileComponent {
  iconProfile!: HTMLElement;
  imgThumbProfile!: HTMLElement;

  admin: any = {};

  genders: any[] = [];
  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];

  result: number = 0;

  isLoading = true;
  public profileForm: FormGroup;
  public passwordForm: FormGroup;
  public newPasswordForm: FormGroup;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private modProfileService: ModProfileService,
    private formbuilder: FormBuilder,
  ) {}

  createFormProfile() {
    this.profileForm = this.formbuilder.group({
      usernameF: ['', Validators.required],
      fullnameF: ['', Validators.required],
      emailF: ['', [Validators.required, Validators.email]],
      introF: [''],
      birthdayF: ['', Validators.required],
      gender_nameF: ['', Validators.required],
      province_nameF: ['', Validators.required],
      district_nameF: ['', Validators.required],
      ward_nameF: ['', Validators.required],
    });

    this.passwordForm = this.formbuilder.group({
      oldPassword: ['', Validators.required],
    });

    this.newPasswordForm = this.formbuilder.group({
      newPassword: ['', Validators.required],
      reNewPassword: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.createFormProfile();
    this.forgotPasswordDialog();

    this.loadAdminData();
    this.loadAllGender();
    this.loadAllProvince();

  }

  loadAdminData(){
    const getProfile = "getProfile";
    this.modProfileService.loadAdminData(getProfile).subscribe(() =>{
      this.admin = {};
      this.admin = this.modProfileService.getAdmin();
      this.isLoading = false;
    })
  }

  loadAllGender(){
    this.modProfileService.loadAllGender().subscribe(() =>{
      this.genders = [];
      this.genders = this.modProfileService.getAllGender();
    })
  }

  loadAllProvince(){
    this.modProfileService.loadAllProvince().subscribe(() =>{
      this.provinces = [];
      this.provinces = this.modProfileService.getAllProvince();

      const province = this.profileForm.get('province_nameF')?.value;
      this.modProfileService.loadAllDistrict(province).subscribe(() =>{
        this.districts = [];
        this.districts = this.modProfileService.getAllDistrict();

        const district = this.profileForm.get('district_nameF')?.value;
        this.modProfileService.loadAllWard(district).subscribe(() =>{
          this.wards = [];
          this.wards = this.modProfileService.getAllWard();

        })
      })
    })
  }

  getProvinceName(){
    const province = this.profileForm.get('province_nameF')?.value;
    this.loadAllDistrict(province);

  }

  loadAllDistrict(province: string){
    this.modProfileService.loadAllDistrict(province).subscribe(() =>{
      this.districts = [];
      this.districts = this.modProfileService.getAllDistrict();
      this.admin.district_name = this.districts[0];

      this.loadAllWard(this.admin.district_name);

    })
  }

  getDistrictName(){
    const district = this.profileForm.get('district_nameF')?.value;
    this.loadAllWard(district);
  }

  loadAllWard(district: string){
    this.modProfileService.loadAllWard(district).subscribe(() =>{
      this.wards = [];
      this.wards = this.modProfileService.getAllWard();
      this.admin.ward_name = this.wards[0];
    })
  }

  updateProfile() {
    if (this.profileForm.valid) {
      const data = {
        username: this.profileForm.get('usernameF')?.value,
        fullname: this.profileForm.get('fullnameF')?.value,
        intro: this.profileForm.get('introF')?.value,
        birthday: this.profileForm.get('birthdayF')?.value,
        province_name: this.profileForm.get('province_nameF')?.value,
        district_name: this.profileForm.get('district_nameF')?.value,
        ward_name: this.profileForm.get('ward_nameF')?.value,
        gender_name: this.profileForm.get('gender_nameF')?.value,
      };
      this.modProfileService.updateProfile(data).subscribe((res) => {
        this.createToast("Thành công!", "Cập nhật thành công", "success");
        this.loadAdminData();
      });
    }
    else{
      this.createToast("Thất bại!", "Cập nhật thất bại" , "error");
    }
  }

  createToast(action: string, content: string, type: string){
    new toast({
      title: action,
      message: content,
      type: type,
      duration: 3000,
    });
  }

  onDateChange(event: any) {
    const daychose = event.target.value;
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    if (dd < 10) dd = parseInt('0' + dd, 10);
    if (mm < 10) mm = parseInt('0' + mm);
    const formattedToday = yyyy + '-' + mm + '-' + dd; //today
    // Split the dates into arrays
    const splitFrom = formattedToday.split('-');
    const splitTo = daychose.split('-');
    // Create Date objects from the arrays
    const toDay = new Date( parseInt(splitFrom[0]), parseInt(splitFrom[1]) - 1, parseInt(splitFrom[2]));
    const dayChoose = new Date(splitTo[0], splitTo[1] - 1, splitTo[2]);
    // Perform the comparison
    if (dayChoose > toDay) {
      event.target.setCustomValidity('Ngày sinh phải bé hơn ngày hiện tại!');
    }
  }

  onInput(event: any) {
    event.target.setCustomValidity('');
  }

  forgotPasswordDialog(){
    const prevBtns = document.querySelectorAll<HTMLElement>(".btn-prev");
    const nextBtns = document.querySelectorAll<HTMLElement>(".btn-next");
    const progress = document.getElementById("progress") as HTMLElement;
    const formSteps = document.querySelectorAll<HTMLElement>(".form-step");
    const progressSteps = document.querySelectorAll<HTMLElement>(".progress-step");

    const reNewPassword = this.el.nativeElement.querySelector("#renewpassword");
    const changePassModal = this.el.nativeElement.querySelector("#changePassModal");

    let formStepsNum = 0;

    nextBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if(formStepsNum == Number(0) && this.passwordForm.valid){
          const data = {
            oldPassword: this.passwordForm.get('oldPassword')?.value
          };
          this.modProfileService.checkPassword(data).subscribe(() => {
            this.result = this.modProfileService.getResultCheckPassword();
            if(this.result == 1){
              this.createToast("Thành công!", "Mật khẩu đã đúng!", "success");
              formStepsNum++;
              updateFormSteps();
              updateProgressbar();
            }else{
              this.createToast("Thất bại!", "Sai mật khẩu!", "error");
            }
          });
        }
        if(formStepsNum == Number(1) && this.newPasswordForm.valid){
          const data = {
            newPassword: this.newPasswordForm.get('newPassword')?.value,
            reNewPassword: this.newPasswordForm.get('reNewPassword')?.value
          };
          if(data.newPassword == data.reNewPassword){
            this.modProfileService.changePassword(data).subscribe();
            this.createToast("Thành công!", "Thay đổi mật khẩu thành công!", "success");
            setTimeout(() => {
              changePassModal.style.display = 'none';
              location.reload();
            }, 600);
          }else{
            reNewPassword.setCustomValidity('Mật khẩu không giống nhau!');
          }
        }
      });
    });

    prevBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        formStepsNum--;
        updateFormSteps();
        updateProgressbar();
      });
    });

    function updateFormSteps() {
      formSteps.forEach((formStep) => {
        formStep.classList.contains("form-step-active") &&
        formStep.classList.remove("form-step-active");
      });
      // display none tắt modal đi
      formSteps[formStepsNum].classList.add("form-step-active");
    }

    function updateProgressbar() {
      progressSteps.forEach((progressStep, idx) => {
        if (idx < formStepsNum + 1) {
          progressStep.classList.add("progress-step-active");
        } else {
          progressStep.classList.remove("progress-step-active");
        }
      });

      const progressActive = document.querySelectorAll<HTMLElement>(
        ".progress-step-active"
      );

      progress.style.width = ((progressActive.length - 1) / (progressSteps.length - 1)) * 100 + "%";
    }
  }

  openProfile() {
    this.iconProfile = this.el.nativeElement.querySelector("#tab-profile");
    this.imgThumbProfile = this.el.nativeElement.querySelector("#img-thumb-profile");
    if (this.iconProfile.classList.contains("hidden")) {
      this.renderer.removeClass(this.iconProfile, "hidden");
      this.renderer.removeClass(this.imgThumbProfile, "col-lg-7");
      this.renderer.addClass(this.imgThumbProfile, "col-lg-10");
      this.renderer.addClass(this.imgThumbProfile, "offset-lg-1");
      setTimeout(() => {
        this.iconProfile.style.opacity = "1";
      }, 0);
    } else {
      this.iconProfile.style.opacity = "0";
      setTimeout(() => {
        this.renderer.addClass(this.iconProfile, "hidden");
        this.renderer.removeClass(this.imgThumbProfile, "col-lg-10");
        this.renderer.removeClass(this.imgThumbProfile, "offset-lg-1");
        this.renderer.addClass(this.imgThumbProfile, "col-lg-7");
      }, 300);
    }
  }
}
