class CreatePanels < ActiveRecord::Migration
  def self.up
    create_table :panels do |t|
      t.string :name, :default => "", :null => false
      t.timestamps
    end
    create_table :layers do |t|
      t.integer :panel_id 
      t.text :img 
      t.integer :version 
      t.timestamps
    end
  end

  def self.down
    drop_table :panels
    drop_table :layers
  end
end
