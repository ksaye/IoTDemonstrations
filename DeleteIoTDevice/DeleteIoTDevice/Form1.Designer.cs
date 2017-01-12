namespace DeleteIoTDevice
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.connectionString = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.deviceId = new System.Windows.Forms.TextBox();
            this.label2 = new System.Windows.Forms.Label();
            this.button1 = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // connectionString
            // 
            this.connectionString.Location = new System.Drawing.Point(32, 64);
            this.connectionString.Multiline = true;
            this.connectionString.Name = "connectionString";
            this.connectionString.Size = new System.Drawing.Size(623, 118);
            this.connectionString.TabIndex = 0;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(27, 36);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(332, 25);
            this.label1.TabIndex = 1;
            this.label1.Text = "Azure IoT Hub Connection String:";
            // 
            // deviceId
            // 
            this.deviceId.Location = new System.Drawing.Point(37, 251);
            this.deviceId.Name = "deviceId";
            this.deviceId.Size = new System.Drawing.Size(400, 31);
            this.deviceId.TabIndex = 2;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(32, 223);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(274, 25);
            this.label2.TabIndex = 3;
            this.label2.Text = "Azure IoT Device to Delete:";
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(443, 223);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(212, 74);
            this.button1.TabIndex = 4;
            this.button1.Text = "Delete Device";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(12F, 25F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(680, 323);
            this.Controls.Add(this.button1);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.deviceId);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.connectionString);
            this.DoubleBuffered = true;
            this.Name = "Form1";
            this.Text = "Delete Azure IoT Device";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox connectionString;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TextBox deviceId;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Button button1;
    }
}

