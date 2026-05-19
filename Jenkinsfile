pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    environment {
        SONAR_SCANNER_HOME = tool 'SonarScanner'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit 'junit.xml'
                }
            }
        }

        stage('Code Quality - SonarQube') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                        ${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=taskapi \
                        -Dsonar.sources=. \
                        -Dsonar.tests=tests \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate()

                        if (qg.status != 'OK') {
                            error "❌ Quality Gate Failed: ${qg.status}"
                        } else {
                            echo "✅ Quality Gate Passed"
                        }
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo "Security scan placeholder (add OWASP ZAP or Snyk here)"
            }
        }

        stage('Deploy to Staging') {
            steps {
                echo "Deploying to staging..."
            }
        }

        stage('Release') {
            steps {
                echo "Release step placeholder"
            }
        }

        stage('Monitoring') {
            steps {
                echo "Monitoring placeholder"
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline SUCCESS"
        }
        failure {
            echo "❌ Pipeline FAILED"
        }
    }
}