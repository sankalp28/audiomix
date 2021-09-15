pipeline
{
       agent any
                stages
                      {
                        stage('build')
                             {
                               steps
                                       {
                                            sh 'npm install'
                                            sh 'npm audit fix'
                                            sh 'npm run build' 
                                            sh 'cd dist'
						  sh 'sudo zip -r AudiomixerUI.zip .'
						  sh 'cd ..'
						  sh 'sudo mv ./dist/AudiomixerUI.zip .'  
                                       }
                             }
                        stage('test')
                             {
                                    steps{
                                           
                                             echo 'testing the application'
                                    } 
                             }
  

                       }
}
