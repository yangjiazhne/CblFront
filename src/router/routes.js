/*
 * @Author: Azhou
 * @Date: 2021-05-11 10:47:01
 * @LastEditors: Azhou
 * @LastEditTime: 2021-11-25 10:07:05
 */
import {
  LoginAndSignUp,
  UserHome,
  PathoTaggerSpace,
  Diagnostic,
  UploadKFB,
  MainPage,
    CancerProjects,
} from '../pages'

const routes = [
  {
    path: '/mainPage',
    component: CancerProjects,
  },
  {
    path: '/entryPage',
    component: LoginAndSignUp,
  },
  {
    path: '/userHome',
    component: UserHome,
    routes: [
      {
        path: '/userHome/upload',
        component: UploadKFB,
      },
    ]
  },
  {
    path: '/diagnostic',
    component:Diagnostic
  },
  {
    path: '/patho-tagger-space',
    component: PathoTaggerSpace,
  },
]

export default routes
